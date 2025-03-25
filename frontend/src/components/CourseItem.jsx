import { Info } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CourseItem = ({ course }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Bail out if no course provided
  if (!course) {
    console.error("No course provided to CourseItem");
    return null;
  }

  // Extract course info with fallbacks
  const courseCode = course.course_code || "Unknown Code";
  const courseTitle = course.title || "Unnamed Course";
  const semOfferedRaw = course.sem_offered || "N/A";
  
  // Format semester offered to use proper capitalization (1s,2s,M -> 1S, 2S, M)
  let semOffered = "N/A";
  if (semOfferedRaw && semOfferedRaw !== "N/A") {
    semOffered = semOfferedRaw
      .split(',')
      .map(sem => {
        // Replace lowercase 's' with uppercase 'S'
        return sem.trim().replace(/(\d+)s/g, '$1S');
      })
      .join(', ');
  }
  
  // Get units directly from course.units
  const courseUnits = course.units || "N/A";
  
  const courseDescription = course.description || "";
  
  return (
    <div className="p-3 rounded border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-y-1">
          <h4 className="font-medium text-gray-900 mr-2">{courseCode}</h4>
          <div className="flex gap-1">
            {semOffered && semOffered !== "N/A" && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                {semOffered}
              </span>
            )}
            {courseUnits && courseUnits !== "N/A" && (
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">
                {courseUnits} units
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-700 truncate">{courseTitle}</p>
        
        {courseDescription && (
          <TooltipProvider>
            <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
              <TooltipTrigger asChild>
                <button 
                  className="mt-1 inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowTooltip(!showTooltip);
                  }}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <Info className="h-3 w-3 mr-1" />
                  Details
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="max-w-md p-4 bg-white border border-gray-200 shadow-lg rounded-lg"
              >
                <p className="text-sm text-gray-700">{courseDescription}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default CourseItem; 