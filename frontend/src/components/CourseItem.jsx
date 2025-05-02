import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useDraggable } from '@dnd-kit/core';

const CourseItem = ({ course, type = "course", enableGradeSelection = false, onGradeChange, compact = false, disabled = false, isInCoursesList = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [grade, setGrade] = useState(course.grade || "");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  
  const {attributes, listeners, setNodeRef} = useDraggable({
    id: course.id || course.course_id,
    data: course,
    disabled: disabled || !isInCoursesList
  });

  // UP Grading System
  const gradeOptions = [
    { value: "", label: "No grade" },
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
  const courseUnits = course.units || "N/A";
  const semOffered = course.sem_offered;
  const isCombinedCourse = courseCode === "HK 12/13" || !!course.combined_courses;
  
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
  
  // Get course description with fallback
  const courseDescription = course.description || "No description available.";
  
  // Function to get tooltip content for combined courses
  const getCombinedCourseTooltipContent = () => {
    if (!course.combined_courses) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h5 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1.5">Description</h5>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{courseDescription}</p>
        </div>
        
        <div>
          <h5 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1.5">Components</h5>
          <div className="space-y-2">
            {course.combined_courses.map((component, index) => (
              <div key={index} className="text-xs text-gray-700 dark:text-gray-300">
                <p className="font-medium">{component.course_code}</p>
                <p className="text-gray-600 dark:text-gray-400">{component.title}</p>
              </div>
            ))}
          </div>
        </div>
        
        {formattedSemOffered.length > 0 && (
          <div>
            <h5 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1.5">Semesters Offered</h5>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {formattedSemOffered.map((sem, index) => (
                <Badge key={index} variant="outline" className="text-[10px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700">
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
        status: status,
        plan_course_id: course.id
      });
      if (response.success) {
        setGrade(newGrade);
        onGradeChange?.(course.id, newGrade);
      } else {
        console.error('Failed to update grade:', response.error);
      }
    } catch (error) {
      console.error('Failed to update grade:', error);
    }
  };

  const getGradeBadgeColor = (grade) => {
    if (!grade) return "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 border-dashed hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-600 dark:hover:text-gray-300 transition-colors";
    
    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade)) {
      // Handle non-numeric grades
      switch (grade) {
        case "INC":
          return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700";
        case "DRP":
          return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700";
        default:
          return "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 border-dashed hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-600 dark:hover:text-gray-300 transition-colors";
      }
    }

    // Handle numeric grades
    if (numericGrade === 1.00) return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700";
    if (numericGrade <= 1.25) return "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700";
    if (numericGrade <= 1.50) return "bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-700";
    if (numericGrade <= 1.75) return "bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700";
    if (numericGrade <= 2.00) return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700";
    if (numericGrade <= 2.25) return "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700";
    if (numericGrade <= 2.75) return "bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700";
    if (numericGrade <= 3.00) return "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700";
    if (numericGrade <= 4.00) return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-700";
    return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700"; // 5.00
  };

  if (compact) {
    return (
      <div className="px-2 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all flex items-center gap-2">
        <div className={`w-1 h-4 rounded-full ${getCourseColor()}`} />
        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{courseCode}</span>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`p-3 rounded border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all flex items-center justify-between relative overflow-hidden ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className={`absolute left-0 top-0 w-1.5 h-full ${getCourseColor()}`}></div>
      
      <div className="flex-1 min-w-0 pl-2">
        <div className="flex items-center flex-wrap gap-y-1">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mr-2">{courseCode}</h4>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="bg-white dark:bg-[hsl(220,10%,15%)] text-gray-700 dark:text-gray-100 border-gray-200 dark:border-[hsl(220,10%,20%)]">
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
                      {grade || "No grade"}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[100px] bg-white dark:bg-gray-800">
                    <ScrollArea className="h-[140px]">
                      {gradeOptions.map((option) => (
                        <DropdownMenuItem 
                          key={option.value} 
                          className={`text-xs py-1.5 ${!option.value ? 'text-[10px]' : ''} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
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
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{course.title}</p>
        
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
              className="w-[370px] p-4 bg-white dark:bg-[hsl(220,10%,15%)] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,20%)] shadow-lg dark:shadow-[hsl(220,10%,10%)]/20 rounded-lg"
            >
              {isCombinedCourse ? (
                getCombinedCourseTooltipContent()
              ) : (
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">Description</h5>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{courseDescription}</p>
                  </div>
                  
                  {formattedSemOffered.length > 0 && (
                    <div>
                      <h5 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">Semesters Offered</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formattedSemOffered.map((sem, index) => (
                          <Badge key={index} variant="outline" className="text-[10px] bg-white dark:bg-[hsl(220,10%,15%)] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-[hsl(220,10%,20%)]">
                            {sem}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {course.prescribed_semesters && course.prescribed_semesters.length > 0 && (
                    <div>
                      <h5 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">Prescribed Semesters</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {course.prescribed_semesters.map((sem, index) => (
                          <Badge key={index} variant="outline" className="text-[10px] bg-white dark:bg-[hsl(220,10%,15%)] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-[hsl(220,10%,20%)]">
                            {`${sem.year}${sem.year === '1' ? 'st' : sem.year === '2' ? 'nd' : sem.year === '3' ? 'rd' : 'th'} Year ${sem.sem === '3' ? 'Mid Year' : sem.sem === '1' ? '1st Sem' : '2nd Sem'}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {(() => {
                      // Check if there are any prerequisites or corequisites
                      const hasPrerequisites = course.requisite_types?.includes('Prerequisite');
                      const hasCorequisites = course.requisite_types?.includes('Corequisite');

                      if (!hasPrerequisites && !hasCorequisites) {
                        return (
                          <div>
                            <h6 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Requisites
                            </h6>
                            <span className="text-xs text-gray-500 dark:text-gray-400">None</span>
                          </div>
                        );
                      }

                      return (
                        <>
                          {hasPrerequisites && (
                            <div>
                              <h6 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Prerequisites
                              </h6>
                              <div className="flex flex-wrap gap-1">
                                {course.requisites === 'None' ? (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">None</span>
                                ) : (
                                  course.requisites.split(',').map((req, index) => (
                                    <Badge 
                                      key={index}
                                      variant="outline" 
                                      className="text-[10px] bg-white dark:bg-[hsl(220,10%,15%)] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-[hsl(220,10%,20%)]"
                                    >
                                      {req.trim()}
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                          {hasCorequisites && (
                            <div>
                              <h6 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Corequisites
                              </h6>
                              <div className="flex flex-wrap gap-1">
                                {course.requisites === 'None' ? (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">None</span>
                                ) : (
                                  course.requisites.split(',').map((req, index) => (
                                    <Badge 
                                      key={index}
                                      variant="outline" 
                                      className="text-[10px] bg-white dark:bg-[hsl(220,10%,15%)] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-[hsl(220,10%,20%)]"
                                    >
                                      {req.trim()}
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default CourseItem; 