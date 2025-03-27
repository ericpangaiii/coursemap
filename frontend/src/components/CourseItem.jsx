import { Info } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { getCourseTypeColor } from "@/lib/utils";

const CourseItem = ({ course, type = "course" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Bail out if no course provided
  if (!course) {
    console.error("No course provided to CourseItem");
    return null;
  }

  // Extract course info with fallbacks
  const courseCode = course.course_code || "Unknown Code";
  const courseTitle = course.title || "Unnamed Course";
  const courseUnits = course.units || "N/A";
  const semOffered = course.sem_offered;
  const isAcademic = course.is_academic !== false; // Default to true if not specified
  
  // Debug log to see what we're getting
  if (typeof window !== 'undefined' && window.ENV === 'development') {
    console.debug(`Course ${courseCode} data:`, { 
      sem_offered: course.sem_offered,
      year: course.year,
      sem: course.sem,
      prescribed_year: course.prescribed_year,
      prescribed_semester: course.prescribed_semester,
      is_academic: course.is_academic,
      type: type,
      course_type: course.course_type
    });
  }
  
  // Normalize course type for color determination
  // First check passed type prop, then course.course_type, then fallback to "course"
  const normalizedType = (type && type !== "course") ? type : 
                         (course.course_type ? course.course_type : "course");
  
  // Get color based on course type using the utility function
  const getCourseColor = () => {
    return getCourseTypeColor(normalizedType, isAcademic);
  };
  
  // Format semester offered to use proper capitalization (1s,2s,M -> 1S, 2S, M)
  let formattedSemOffered = [];
  if (semOffered) {
    formattedSemOffered = semOffered
      .split(',')
      .map(sem => {
        // Format semester based on value
        const trimmed = sem.trim();
        if (trimmed.toLowerCase() === "m") return "Mid Year";
        // Replace patterns like "1s" or "2s" with "1st Sem" or "2nd Sem"
        if (trimmed === "1s" || trimmed === "1S") return "1st Sem";
        if (trimmed === "2s" || trimmed === "2S") return "2nd Sem";
        return trimmed;
      });
  }
  
  // Get prescribed year and semester directly from the course data
  // In the API response, the fields are 'year' and 'sem'
  // Fallback chain: year > prescribed_year, sem > semester > prescribed_semester
  const prescribedYear = course.year !== undefined ? course.year : (course.prescribed_year || null);
  const prescribedSemester = course.sem !== undefined ? course.sem : 
                           (course.semester !== undefined ? course.semester : (course.prescribed_semester || null));
  
  // Format prescribed semester for display
  const formatSemester = (sem) => {
    if (!sem && sem !== 0 && sem !== '0') return null;
    
    // Convert to string in case it's a number
    const semStr = String(sem);
    
    if (semStr === "1") return "1st Sem";
    if (semStr === "2") return "2nd Sem";
    if (semStr.toLowerCase() === "m" || semStr === "3") return "Mid Year";
    if (semStr === "0") return "Any";
    return semStr; // Return as is if it doesn't match known formats
  };
  
  // Format year for display
  const formatYear = (year) => {
    if (!year && year !== 0 && year !== '0') return null;
    
    // Convert to string in case it's a number
    const yearStr = String(year);
    
    if (yearStr === "0") return "Any Year";
    if (yearStr === "1") return "1st Year";
    if (yearStr === "2") return "2nd Year";
    if (yearStr === "3") return "3rd Year";
    if (yearStr === "4") return "4th Year";
    if (yearStr === "5") return "5th Year";
    return `${yearStr}th Year`; // Fallback for other numbers
  };
  
  // Build the prescribed information text
  let prescribedText = "";
  
  if ((prescribedYear === 0 || prescribedYear === '0') && 
      (prescribedSemester === 0 || prescribedSemester === '0')) {
    prescribedText = "Any Year, Any Semester";
  } else {
    const yearText = (prescribedYear === 0 || prescribedYear === '0') 
                   ? "Any Year" 
                   : formatYear(prescribedYear);
    const semText = formatSemester(prescribedSemester);
    
    if (yearText && semText) {
      prescribedText = `${yearText}, ${semText}`;
    } else if (yearText) {
      prescribedText = yearText;
    } else if (semText) {
      prescribedText = semText;
    }
  }

  const courseDescription = course.description || "No description available";
  
  return (
    <div className={`p-3 rounded border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-between relative overflow-hidden ${!isAcademic ? 'bg-gray-50' : ''}`}>
      <div className={`absolute left-0 top-0 w-1.5 h-full ${getCourseColor()}`}></div>
      <div className="flex-1 min-w-0 pl-2">
        <div className="flex items-center flex-wrap gap-y-1">
          <h4 className={`font-medium ${isAcademic ? 'text-gray-900' : 'text-gray-600'} mr-2`}>{courseCode}</h4>
          <Badge variant="outline" className="ml-1 bg-white">
            {courseUnits} units
          </Badge>
        </div>
        <p className="text-sm text-gray-700 truncate">{courseTitle}</p>
        
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
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-sm text-gray-600">Description</h5>
                  <p className="text-sm text-gray-700">{courseDescription}</p>
                </div>
                
                {formattedSemOffered.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm text-gray-600">Semesters Offered</h5>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formattedSemOffered.map((sem, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-white">
                          {sem}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {prescribedText && (
                  <div>
                    <h5 className="font-medium text-sm text-gray-600">Prescribed</h5>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs bg-white">
                        {prescribedText}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default CourseItem; 