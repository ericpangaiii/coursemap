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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CourseItem = ({ course, type = "course", onYearChange, onSemesterChange, inPlanCreation = false, yearPlaceholder = "Year", semesterPlaceholder = "Semester" }) => {
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
  const isCombinedCourse = courseCode === "HK 12/13" || !!course.combined_courses;
  
  // Year options
  const yearOptions = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
    { value: "5", label: "5th Year" }
  ];

  // Semester options
  const semesterOptions = [
    { value: "1", label: "1st Semester" },
    { value: "2", label: "2nd Semester" },
    { value: "M", label: "Mid Year" }
  ];
  
  // Normalize course type for color determination
  const normalizedType = (type && type !== "course") ? type : 
                         (course.course_type ? course.course_type : "course");
  
  // Get color based on course type using the utility function
  const getCourseColor = () => {
    return getCourseTypeColor(normalizedType);
  };
  
  // Format semester offered to use proper capitalization (1s,2s,M -> 1st Sem, 2nd Sem, Mid Year)
  let formattedSemOffered = [];
  if (semOffered) {
    formattedSemOffered = semOffered.split(',').map(sem => {
      const trimmedSem = sem.trim();
      return trimmedSem === '1' || trimmedSem === '1s' || trimmedSem === '1S' ? '1st Sem' : 
             trimmedSem === '2' || trimmedSem === '2s' || trimmedSem === '2S' ? '2nd Sem' : 
             trimmedSem === 'M' || trimmedSem === 'm' ? 'Mid Year' : trimmedSem;
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
  
  // Process prescribed semester information from course data
  if ((prescribedYear === 0 || prescribedYear === '0') && 
      (prescribedSemester === 0 || prescribedSemester === '0')) {
    // Don't set any default text, leave empty if there's no information
    prescribedText = "";
  } else {
    const yearText = (prescribedYear === 0 || prescribedYear === '0') 
                  ? "" 
                  : formatYear(prescribedYear);
    const semText = formatSemester(prescribedSemester);
    
    if (yearText && semText) {
      prescribedText = `${yearText} ${semText}`;
    } else if (yearText) {
      prescribedText = yearText;
    } else if (semText) {
      prescribedText = semText;
    }
  }

  // Clean up the course description, handle "No Available DATA" case
  const getCourseDescription = () => {
    // Check if there's no description or it contains the "No Available DATA" text
    if (!course.description || course.description.trim() === "No Available DATA" || course.description.trim() === "No available data") {
      return "No description available for this course.";
    }
    return course.description;
  };

  const courseDescription = getCourseDescription();
  
  // For combined courses like HK 12/13, create a special tooltip content
  const getCombinedCourseTooltipContent = () => {
    if (!isCombinedCourse || !course.combined_courses) return null;
    
    return (
      <div className="space-y-3">
        <div>
          <h5 className="font-medium text-sm text-gray-600">Course Options</h5>
          <p className="text-sm text-gray-700">
            Take one of these courses to fulfill this requirement:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {course.combined_courses.map((c, index) => (
              <li key={index} className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2"></div>
                <span className="font-medium">{c.course_code}</span>
                <span className="mx-1">-</span>
                <span>{c.title}</span>
                {c.course_code === "HK 13" && (
                  <span className="ml-1 text-xs text-blue-600 italic font-medium">(for varsity)</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        
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
    );
  };
  
  return (
    <div className="p-3 rounded border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-between relative overflow-hidden">
      <div className={`absolute left-0 top-0 w-1.5 h-full ${getCourseColor()}`}></div>
      <div className="flex-1 min-w-0 pl-2">
        <div className="flex items-center flex-wrap gap-y-1">
          <h4 className="font-medium text-gray-900 mr-2">{courseCode}</h4>
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
              className="max-w-md p-5 bg-white border border-gray-200 shadow-lg rounded-lg"
            >
              {isCombinedCourse ? (
                getCombinedCourseTooltipContent()
              ) : (
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-sm text-gray-700 mb-1.5">Description</h5>
                    <p className="text-sm text-gray-700 leading-relaxed">{courseDescription}</p>
                  </div>
                  
                  {formattedSemOffered.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-700 mb-1.5">Semesters Offered</h5>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {formattedSemOffered.map((sem, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-white text-gray-900 border-gray-200">
                            {sem}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(prescribedText || course.prescribed_note) && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-700 mb-1.5">Prescribed Semester</h5>
                      {course.prescribed_note ? (
                        <div className="mt-1.5">
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {Array.isArray(course.prescribed_note) 
                              ? course.prescribed_note.map((semester, idx) => {
                                  const trimmedSemester = semester.trim();
                                  return (
                                    <Badge key={idx} variant="outline" className="text-xs bg-white text-gray-900 border-gray-200">
                                      {trimmedSemester}
                                    </Badge>
                                  );
                                })
                              : typeof course.prescribed_note === 'string'
                                ? course.prescribed_note.split(',').map((semester, idx) => {
                                    const trimmedSemester = semester.trim();
                                    return (
                                      <Badge key={idx} variant="outline" className="text-xs bg-white text-gray-900 border-gray-200">
                                        {trimmedSemester}
                                      </Badge>
                                    );
                                  })
                                : null
                            }
                          </div>
                        </div>
                      ) : prescribedText ? (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <Badge variant="outline" className="text-xs bg-white text-gray-900">
                            {prescribedText}
                          </Badge>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {inPlanCreation && (
        <div className="flex flex-col gap-2">
          <Select
            value={course.year || ""}
            onValueChange={(value) => onYearChange?.(course.id, value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={yearPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={course.semester || ""}
            onValueChange={(value) => onSemesterChange?.(course.id, value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={semesterPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {semesterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default CourseItem; 