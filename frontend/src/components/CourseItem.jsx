import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { coursesAPI } from '@/lib/api';
import { getCourseTypeColor } from "@/lib/utils";
import { Info } from "lucide-react";
import { useState } from "react";

const CourseItem = ({ course, type = "course", onYearChange, onSemesterChange, inPlanCreation = false, yearPlaceholder = "Year", semesterPlaceholder = "Semester", enableGradeSelection = false, onGradeChange }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [grade, setGrade] = useState(course.grade || "");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(course.grade || '');
  const [isHovered, setIsHovered] = useState(false);
  const [isGradeHovered, setIsGradeHovered] = useState(false);
  const [isGradeDialogHovered, setIsGradeDialogHovered] = useState(false);
  
  // UP Grading System
  const gradeOptions = [
    { value: "", label: "Not yet completed" },
    { value: "1.00", label: "1.00" },
    { value: "1.25", label: "1.25" },
    { value: "1.50", label: "1.50" },
    { value: "1.75", label: "1.75" },
    { value: "2.00", label: "2.00" },
    { value: "2.25", label: "2.25" },
    { value: "2.50", label: "2.50" },
    { value: "2.75", label: "2.75" },
    { value: "3.00", label: "3.00" },
    { value: "4.00", label: "4.00" },
    { value: "5.00", label: "5.00" },
    { value: "INC", label: "INC" },
    { value: "DRP", label: "DRP" }
  ];
  
  // Bail out if no course provided
  if (!course) {
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
  const normalizedType = (type && type !== "course") ? type.toLowerCase() : 
                         (course.course_type ? course.course_type.toLowerCase() : "course");
  
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
  if (prescribedYear || prescribedSemester) {
    const yearText = formatYear(prescribedYear);
    const semText = formatSemester(prescribedSemester);
    
    if (yearText && semText) {
      prescribedText = `${yearText} ${semText}`;
    } else if (yearText) {
      prescribedText = `${yearText}`;
    } else if (semText) {
      prescribedText = `${semText}`;
    }
  }
  
  // Get course description with fallback
  const courseDescription = course.description || "No description available.";
  
  // Function to get tooltip content for combined courses
  const getCombinedCourseTooltipContent = () => {
    if (!course.combined_courses) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h5 className="font-medium text-sm text-gray-700 mb-1.5">Description</h5>
          <p className="text-sm text-gray-700 leading-relaxed">{courseDescription}</p>
        </div>
        
        <div>
          <h5 className="font-medium text-sm text-gray-700 mb-1.5">Components</h5>
          <div className="space-y-2">
            {course.combined_courses.map((component, index) => (
              <div key={index} className="text-sm text-gray-700">
                <p className="font-medium">{component.course_code}</p>
                <p className="text-gray-600">{component.title}</p>
              </div>
            ))}
          </div>
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
      </div>
    );
  };
  
  const handleGradeChange = async (newGrade) => {
    try {
      // Update both grade and status
      const status = newGrade && newGrade !== "" && !['INC', 'DRP'].includes(newGrade) ? 'completed' : 'planned';
      const response = await coursesAPI.updateCourse(course.course_id, { 
        grade: newGrade,
        status: status
      });
      if (response.success) {
        setGrade(newGrade);
        onGradeChange?.(course.course_id, newGrade);
      } else {
        console.error('Failed to update grade:', response.error);
      }
    } catch (error) {
      console.error('Failed to update grade:', error);
    }
  };

  const getGradeBadgeColor = (grade) => {
    if (!grade) return "bg-white text-gray-500 border-gray-200 border-dashed hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600 transition-colors";
    
    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade)) {
      // Handle non-numeric grades
      switch (grade) {
        case "INC":
          return "bg-yellow-100 text-yellow-700 border-yellow-200";
        case "DRP":
          return "bg-red-100 text-red-700 border-red-200";
        default:
          return "bg-white text-gray-500 border-gray-200 border-dashed hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600 transition-colors";
      }
    }

    // Handle numeric grades
    if (numericGrade === 1.00) return "bg-green-100 text-green-700 border-green-200";
    if (numericGrade <= 1.25) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (numericGrade <= 1.50) return "bg-teal-100 text-teal-700 border-teal-200";
    if (numericGrade <= 1.75) return "bg-cyan-100 text-cyan-700 border-cyan-200";
    if (numericGrade <= 2.00) return "bg-blue-100 text-blue-700 border-blue-200";
    if (numericGrade <= 2.25) return "bg-indigo-100 text-indigo-700 border-indigo-200";
    if (numericGrade <= 2.75) return "bg-violet-100 text-violet-700 border-violet-200";
    if (numericGrade <= 3.00) return "bg-purple-100 text-purple-700 border-purple-200";
    if (numericGrade <= 4.00) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-red-100 text-red-700 border-red-200"; // 5.00
  };

  return (
    <div className="p-3 rounded border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-between relative overflow-hidden">
      <div className={`absolute left-0 top-0 w-1.5 h-full ${getCourseColor()}`}></div>
      
      <div className="flex-1 min-w-0 pl-2">
        <div className="flex items-center flex-wrap gap-y-1">
          <h4 className="font-medium text-gray-900 mr-2">{courseCode}</h4>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="bg-white">
              {courseUnits} units
            </Badge>
            {enableGradeSelection && (
              <div className="flex items-center">
                <DropdownMenu open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                  <DropdownMenuTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className={`cursor-pointer hover:opacity-80 ${getGradeBadgeColor(grade)}`}
                    >
                      {grade || "Not yet completed"}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[100px]">
                    <ScrollArea className="h-[140px]">
                      {gradeOptions.map((option) => (
                        <DropdownMenuItem 
                          key={option.value} 
                          className={`text-xs py-1.5 ${!option.value ? 'text-[10px]' : ''}`}
                          onClick={() => handleGradeChange(option.value)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 truncate">{course.title}</p>
        
        <TooltipProvider>
          <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
            <TooltipTrigger asChild>
              <div 
                className="mt-1 inline-flex items-center text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
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
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              className="max-w-md p-4 bg-white border border-gray-200 shadow-lg rounded-lg"
            >
              {isCombinedCourse ? (
                getCombinedCourseTooltipContent()
              ) : (
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-xs text-gray-700 mb-1">Description</h5>
                    <p className="text-xs text-gray-700 leading-relaxed">{courseDescription}</p>
                  </div>
                  
                  {formattedSemOffered.length > 0 && (
                    <div>
                      <h5 className="font-medium text-xs text-gray-700 mb-1">Semesters Offered</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formattedSemOffered.map((sem, index) => (
                          <Badge key={index} variant="outline" className="text-[10px] bg-white text-gray-900 border-gray-200">
                            {sem}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {prescribedText && (
                    <div>
                      <h5 className="font-medium text-xs text-gray-700 mb-1">Prescribed Schedule</h5>
                      <p className="text-xs text-gray-700">{prescribedText}</p>
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