import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import YearGrid from "./YearGrid";
import StepProgress from "./StepProgress";
import InfoMessage from "./InfoMessage";
import { useState } from "react";
import CurriculumViewToggle from "./CurriculumViewToggle";

const COURSE_STEPS = [
  { id: 'ge_electives', label: 'GE Electives', type: 'GE Elective' },
  { id: 'free_electives', label: 'Free Electives', type: 'Elective' },
  { id: 'majors', label: 'Majors', type: 'Major' },
  { id: 'required_academic', label: 'Required Academic', type: 'Required Academic' },
  { id: 'required_non_academic', label: 'Required Non-Academic', type: 'Required Non-Academic' },
  { id: 'summary', label: 'Summary', type: 'summary' },
];

const PlanOverview = ({ semesterGrid, onDeleteCourse, onClearAll, courseTypeCounts, currentStepType, filteredCourses, activeCourse, currentStep, courseSteps, courses }) => {
  const years = [1, 2, 3, 4];
  const isDragging = activeCourse !== null;
  const [showCurriculum, setShowCurriculum] = useState(false);

  const handleSemesterClick = (year, semester) => {
    // TODO: Handle semester click
    console.log(`Clicked ${year} Year, ${semester} Semester`);
  };

  const handleCurriculumViewToggle = (checked) => {
    setShowCurriculum(checked);
    console.log('Curriculum view toggled:', checked);
    
    // Log required courses when curriculum view is toggled
    if (courses) {
      const requiredAcademic = courses.filter(course => course.course_type === 'Required Academic');
      const requiredNonAcademic = courses.filter(course => course.course_type === 'Required Non-Academic');
      
      console.log('Required Academic Courses:', requiredAcademic);
      console.log('Required Non-Academic Courses:', requiredNonAcademic);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="pt-2 px-2">
        <StepProgress 
          currentStep={currentStep}
          courseSteps={courseSteps}
        />
      </div>
      <InfoMessage 
        isDragging={isDragging} 
        currentStepType={currentStepType}
        courseTypeCounts={courseTypeCounts}
        filteredCourses={filteredCourses}
        semesterGrid={semesterGrid}
      />
      <div className="flex justify-between items-center mb-4 pr-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Plan Overview</h2>
        </div>
        <div className="flex items-center gap-4">
          {currentStepType !== 'summary' && (
            <>
              <CurriculumViewToggle 
                isEnabled={showCurriculum} 
                onToggle={handleCurriculumViewToggle}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={onClearAll}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-4 gap-3 pr-4">
          {years.map((year) => (
            <YearGrid 
              key={year}
              year={year}
              onSemesterClick={handleSemesterClick}
              semesterGrid={semesterGrid}
              onDeleteCourse={currentStepType !== 'summary' ? onDeleteCourse : undefined}
              activeCourse={currentStepType !== 'summary' ? activeCourse : null}
              courseTypeCounts={courseTypeCounts}
              currentStepType={currentStepType}
              showCurriculum={showCurriculum}
              courses={courses}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlanOverview; 