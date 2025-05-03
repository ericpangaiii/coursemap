import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDroppable } from '@dnd-kit/core';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentTypeCount, getPrescribedCount, isPrescribedSemester } from "@/lib/courseCounts";
import PlanCourse from "./PlanCourse";
import UnitsCounter from "./UnitsCounter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSemesterWarnings } from "@/lib/warningsTracker";

const SemesterButton = ({ year, semester, courses = [], onDeleteCourse, activeCourse, courseTypeCounts, currentStepType, semesterGrid }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${year}-${semester.id}`,
    data: {
      year,
      semester: semester.id
    },
    disabled: currentStepType === 'summary'
  });

  const isPrescribed = isPrescribedSemester(activeCourse, year, semester.id);
  const currentCount = getCurrentTypeCount(courses, activeCourse?.course_type);
  const prescribedCount = getPrescribedCount(courseTypeCounts, activeCourse?.course_type, year, semester.id);
  const isCountReached = currentCount >= prescribedCount;

  // Get warnings for this semester
  const warnings = currentStepType === 'summary' ? getSemesterWarnings(courses, semester.id, year, semesterGrid) : null;
  const hasWarnings = warnings && (
    warnings.underload || 
    warnings.overload || 
    warnings.missingPrerequisites.length > 0 || 
    warnings.missingCorequisites.length > 0
  );

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-2 rounded-lg border border-gray-200 dark:border-gray-800 transition-all relative",
        semester.id === 'M' ? 'min-h-[80px]' : 'min-h-[120px]',
        isOver && 'border-blue-400 dark:border-blue-600 bg-blue-100 dark:bg-blue-900/30 shadow-md',
        isPrescribed && !isOver && !isCountReached && 'border-blue-300 dark:border-blue-700 bg-blue-100/80 dark:bg-blue-900/25',
        currentStepType === 'summary' && 'cursor-default'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-xs text-gray-600 dark:text-gray-300">
          {semester.label}
        </h3>
        {currentStepType === 'summary' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "pr-1",
                  hasWarnings ? "text-yellow-500 dark:text-yellow-400" : "text-green-500 dark:text-green-400"
                )}>
                  {hasWarnings ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent 
                side="right"
                className="p-4 bg-white dark:bg-[hsl(220,10%,15%)] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,20%)] shadow-lg dark:shadow-[hsl(220,10%,10%)]/20 rounded-lg"
              >
                {hasWarnings ? (
                  <div className="space-y-3">
                    {warnings.underload && (
                      <div>
                        <h5 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">Underload</h5>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{warnings.underload.details.replace(/[()]/g, '')}</p>
                      </div>
                    )}
                    {warnings.overload && (
                      <div>
                        <h5 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">Overload</h5>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{warnings.overload.details.replace(/[()]/g, '')}</p>
                      </div>
                    )}
                    {warnings.missingPrerequisites.length > 0 && (
                      <div>
                        <h5 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">
                          Missing {warnings.missingPrerequisites.length === 1 ? 'Prerequisite' : 'Prerequisites'}
                        </h5>
                        <div className="space-y-1">
                          {warnings.missingPrerequisites.map((course, idx) => (
                            <div key={idx} className="text-xs text-gray-700 dark:text-gray-300">
                              <span>{course.course_code}</span> needs {course.requisites.split(',').length > 1 ? 'either ' : ''}{course.requisites.split(',').join(' or ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {warnings.missingCorequisites.length > 0 && (
                      <div>
                        <h5 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">
                          Missing {warnings.missingCorequisites.length === 1 ? 'Corequisite' : 'Corequisites'}
                        </h5>
                        <div className="space-y-1">
                          {warnings.missingCorequisites.map((course, idx) => (
                            <div key={idx} className="text-xs text-gray-700 dark:text-gray-300">
                              <span className="font-medium">{course.course_code}</span> needs {course.requisites}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-700 dark:text-gray-300">No issues detected in this semester.</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="space-y-1.5 pb-5">
        {courses.map((course) => (
          <PlanCourse 
            key={course.course_id}
            course={course} 
            onDelete={(course) => onDeleteCourse(year, semester.id, course)}
            currentStepType={currentStepType}
          />
        ))}
      </div>
      <div className="absolute bottom-2 right-2">
        <UnitsCounter courses={courses} />
      </div>
    </div>
  );
};

const YearGrid = ({ year, semesterGrid, onDeleteCourse, activeCourse, courseTypeCounts, currentStepType }) => {
  const semesters = [
    { id: '1', label: '1st Sem' },
    { id: '2', label: '2nd Sem' },
    { id: '3', label: 'Mid Year' }
  ];

  const getYearLabel = (year) => {
    switch (year) {
      case 1: return '1st Year';
      case 2: return '2nd Year';
      case 3: return '3rd Year';
      case 4: return '4th Year';
      default: return `${year} Year`;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pt-3 pb-1 px-3">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">{getYearLabel(year)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3 py-2 pb-4">
        {semesters.map((semester) => (
          <SemesterButton
            key={semester.id}
            year={year}
            semester={semester}
            courses={semesterGrid[`${year}-${semester.id}`] || []}
            onDeleteCourse={onDeleteCourse}
            activeCourse={activeCourse}
            courseTypeCounts={courseTypeCounts}
            currentStepType={currentStepType}
            semesterGrid={semesterGrid}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default YearGrid; 