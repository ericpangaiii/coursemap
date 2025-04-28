import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PlanOverview from "./PlanOverview";
import CoursesList from "./CoursesList";
import { LoadingSpinner } from "@/components/ui/loading";
import { coursesAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { getCourseTypeColor } from "@/lib/utils";
import { usePlanDragAndDrop } from "./usePlanDragAndDrop";

const COURSE_STEPS = [
  { id: 'ge_electives', label: 'GE Electives', type: 'GE Elective' },
  { id: 'free_electives', label: 'Free Electives', type: 'Elective' },
  { id: 'majors', label: 'Majors', type: 'Major' },
  { id: 'required_academic', label: 'Required Academic', type: 'Required Academic' },
  { id: 'required_non_academic', label: 'Required Non-Academic', type: 'Required Non-Academic' },
];

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

const PlanCreationModal = ({ open, onOpenChange }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const { activeId, semesterGrid, handleDragStart, handleDragEnd, handleDeleteCourse, handleClearAll } = usePlanDragAndDrop(initializeEmptyGrid());

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await coursesAPI.getAllCourses();
        if (response.success) {
          setCourses(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchCourses();
    }
  }, [open]);
  
  const currentStepType = COURSE_STEPS[currentStep].type;
  const filteredCourses = courses.filter(course => course.course_type === currentStepType);

  const handleStepChange = (newStep) => {
    if (newStep >= 0 && newStep < COURSE_STEPS.length) {
      setCurrentStep(newStep);
    }
  };

  const activeCourse = activeId ? courses.find(course => course.course_id === activeId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DndContext 
        onDragStart={handleDragStart} 
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
            <div className="flex-1 flex overflow-hidden">
              <div className="w-[60%] h-full overflow-hidden">
                <PlanOverview 
                  currentStep={currentStep}
                  totalSteps={COURSE_STEPS.length}
                  onStepChange={handleStepChange}
                  stepLabel={COURSE_STEPS[currentStep].label}
                  semesterGrid={semesterGrid}
                  onDeleteCourse={handleDeleteCourse}
                  onClearAll={handleClearAll}
                />
              </div>
              <div className="w-[40%] h-full overflow-hidden">
                <CoursesList 
                  courses={filteredCourses}
                  loading={loading}
                  currentStep={currentStep}
                  totalSteps={COURSE_STEPS.length}
                  onStepChange={handleStepChange}
                  semesterGrid={semesterGrid}
                />
              </div>
            </div>
          )}
          <DragOverlay>
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