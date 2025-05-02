import { Info, CheckCircle2 } from "lucide-react";
import { getCurrentTypeCount } from "@/lib/courseCounts";

const InfoMessage = ({ isDragging, currentStepType, courseTypeCounts, filteredCourses, semesterGrid }) => {
  if (!currentStepType) return null;

  // For required academic and non-academic, use filtered courses length
  const isRequiredType = currentStepType === 'Required Academic' || currentStepType === 'Required Non-Academic';
  const requiredCount = isRequiredType 
    ? filteredCourses.length 
    : courseTypeCounts?.totals[currentStepType?.toLowerCase().replace(' ', '_')] || 0;

  // Calculate current count from semester grid
  const currentCount = Object.values(semesterGrid).reduce((total, semesterCourses) => {
    return total + getCurrentTypeCount(semesterCourses, currentStepType);
  }, 0);

  const remainingCount = requiredCount - currentCount;

  if (isDragging) {
    return (
      <div className="mb-4 pl-1 pr-4">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800 dark:text-blue-200">
            The highlighted semesters are suggestions based on your curriculum; you can add this course to any semester.
          </p>
        </div>
      </div>
    );
  }

  if (remainingCount <= 0) {
    return (
      <div className="mb-4 pl-1 pr-4">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800 dark:text-blue-200">
            {currentStepType === 'summary' 
              ? 'Review your plan summary and check for any warnings. You can create your plan or go back to make adjustments.'
              : `Great! You've added all required ${currentStepType} courses. You can proceed to the next step or adjust your course placements.`
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 pl-1 pr-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-800 dark:text-blue-200">
          {isRequiredType 
            ? `Drag and drop ${remainingCount} more ${currentStepType} course${remainingCount !== 1 ? 's' : ''} to complete this step. You can also use the "Assign All" button to automatically assign all courses to their prescribed semesters.`
            : `Drag and drop ${remainingCount} more ${currentStepType} course${remainingCount !== 1 ? 's' : ''} to complete this step.`
          }
        </p>
      </div>
    </div>
  );
};

export default InfoMessage; 