import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading";
import { coursesAPI, curriculumsAPI } from "@/lib/api";
import { getCourseTypeColor } from "@/lib/utils";
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useEffect, useMemo, useState } from "react";
import CoursesList from "./CoursesList";
import PlanOverview from "./PlanOverview";
import SummaryStep from "./SummaryStep";
import { usePlanDragAndDrop } from "./usePlanDragAndDrop";

// Initialize empty grid with 4 years and 3 semesters each (including midyear)
const initializeEmptyGrid = () => {
  const grid = {};
  for (let year = 1; year <= 4; year++) {
    // Add regular semesters (1 and 2)
    for (let semester = 1; semester <= 2; semester++) {
      grid[`${year}-${semester}`] = [];
    }
    // Add midyear semester
    grid[`${year}-M`] = [];
  }
  return grid;
};

const PlanCreationModal = ({ open, onOpenChange, onPlanCreated }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [curriculumId, setCurriculumId] = useState(null);
  const { activeId, semesterGrid, setSemesterGrid, handleDragStart, handleDragEnd, handleDeleteCourse, handleClearAll } = usePlanDragAndDrop(initializeEmptyGrid());
  const [courseTypeCounts, setCourseTypeCounts] = useState(null);

  // Get curriculum ID and fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        // First get the curriculum ID
        const curriculumResponse = await curriculumsAPI.getCurrentCurriculumStructure();
        const curriculumId = curriculumResponse?.curriculum?.curriculum_id;
        
        if (curriculumId) {
          setCurriculumId(curriculumId);
          
          // Fetch all data in parallel
          const [coursesResponse, courseTypeCountsResponse] = await Promise.all([
            coursesAPI.getCoursesForPlanCreation(),
            curriculumsAPI.getCurriculumCourseTypeCounts(curriculumId)
          ]);

          if (coursesResponse.success) {
            setCourses(coursesResponse.data);
          }
          if (courseTypeCountsResponse) {
            setCourseTypeCounts(courseTypeCountsResponse);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open]);

  // Generate course steps based on courseTypeCounts
  const courseSteps = useMemo(() => {
    if (!courseTypeCounts) return [];

    const steps = [];
    
    // Add GE Electives if count > 0
    if (courseTypeCounts.totals.ge_elective > 0) {
      steps.push({ id: 'ge_electives', label: 'GE Electives', type: 'GE Elective' });
    }
    
    // Add Free Electives if count > 0
    if (courseTypeCounts.totals.elective > 0) {
      steps.push({ id: 'free_electives', label: 'Free Electives', type: 'Elective' });
    }
    
    // Add Majors if count > 0
    if (courseTypeCounts.totals.major > 0) {
      steps.push({ id: 'majors', label: 'Majors', type: 'Major' });
    }
    
    // Add Required Academic if count > 0
    if (courseTypeCounts.totals.required > 0) {
      steps.push({ id: 'required_academic', label: 'Required Academic', type: 'Required Academic' });
    }
    
    // Add Required Non-Academic if count > 0
    if (courseTypeCounts.totals.required > 0) {
      steps.push({ id: 'required_non_academic', label: 'Required Non-Academic', type: 'Required Non-Academic' });
    }
    
    // Always add Summary as the last step
    steps.push({ id: 'summary', label: 'Summary', type: 'summary' });
    
    return steps;
  }, [courseTypeCounts]);

  const currentStepType = courseSteps[currentStep]?.type;
  const filteredCourses = courses.filter(course => course.course_type === currentStepType);
  const isSummaryStep = currentStepType === 'summary';

  // Calculate if target is reached
  const getCurrentCount = (type) => {
    return Object.values(semesterGrid).reduce((total, semesterCourses) => {
      return total + semesterCourses.filter(course => {
        const courseType = course.course_type?.toLowerCase().replace(/[\s_]/g, '');
        const targetType = type?.toLowerCase().replace(/[\s_]/g, '');
        return courseType === targetType;
      }).length;
    }, 0);
  };

  const currentCount = getCurrentCount(currentStepType);
  const isRequiredType = currentStepType === 'Required Academic' || currentStepType === 'Required Non-Academic';
  const requiredCount = isRequiredType 
    ? filteredCourses.length 
    : courseTypeCounts?.totals[currentStepType?.toLowerCase().replace(' ', '_')] || 0;
  const isTargetReached = currentCount >= requiredCount;

  // Modify handleDragStart to prevent dragging when target is reached
  const handleDragStartWithCheck = (event) => {
    if (!isTargetReached) {
      handleDragStart(event);
    }
  };

  const handleStepChange = (newStep, newGrid) => {
    if (newStep >= 0 && newStep < courseSteps.length) {
      setCurrentStep(newStep);
      // If a new grid is provided, update the semester grid
      if (newGrid) {
        setSemesterGrid(newGrid);
      }
    }
  };

  const activeCourse = activeId ? courses.find(course => course.id === activeId || course.course_id === activeId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DndContext 
        onDragStart={handleDragStartWithCheck} 
        onDragEnd={handleDragEnd}
      >
        <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex-1">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden gap-6">
              <div className="w-[65%] h-full overflow-hidden">
                <PlanOverview 
                  semesterGrid={semesterGrid}
                  onDeleteCourse={handleDeleteCourse}
                  onClearAll={handleClearAll}
                  courseTypeCounts={courseTypeCounts}
                  activeCourse={activeCourse}
                  currentStepType={currentStepType}
                  filteredCourses={filteredCourses}
                  currentStep={currentStep}
                  courseSteps={courseSteps}
                />
              </div>
              <div className="w-[35%] h-full overflow-hidden">
                {isSummaryStep ? (
                  <SummaryStep 
                    semesterGrid={semesterGrid}
                    courseTypeCounts={courseTypeCounts}
                    currentStep={currentStep}
                    onStepChange={handleStepChange}
                    curriculumId={curriculumId}
                    onPlanCreated={onPlanCreated}
                    onOpenChange={onOpenChange}
                  />
                ) : (
                  <CoursesList 
                    courses={filteredCourses}
                    loading={loading}
                    currentStep={currentStep}
                    totalSteps={courseSteps.length}
                    onStepChange={handleStepChange}
                    semesterGrid={semesterGrid}
                    isTargetReached={isTargetReached}
                    courseSteps={courseSteps}
                  />
                )}
              </div>
            </div>
          )}
          <DragOverlay dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {activeCourse ? (
              <div className="w-[120px] px-2 py-1.5 rounded-md border border-gray-200 bg-white dark:bg-gray-800 shadow-lg flex items-center gap-2">
                <div className={`w-1 h-4 rounded-full ${getCourseTypeColor(activeCourse.course_type?.toLowerCase())}`} />
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{activeCourse.course_code}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DialogContent>
      </DndContext>
    </Dialog>
  );
};

export default PlanCreationModal; 