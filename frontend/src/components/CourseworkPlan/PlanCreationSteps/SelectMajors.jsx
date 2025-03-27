import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, CheckCircle2, AlertTriangle, Loader2, Search, RotateCcw, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CourseItem from "@/components/CourseItem";

const SelectMajors = ({ onSelectionChange, courses = [], requiredCount = 4, loading = false }) => {
  // State to track selected courses
  const [selectedCourses, setSelectedCourses] = useState({});
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    // Log courses data for debugging
    console.log("Major courses:", courses);
    console.log("Required count:", requiredCount);
  }, [courses, requiredCount]);

  // Helper function to count completed selections
  const countCompletedSelections = (courses) => {
    return Object.values(courses).filter(
      course => course?.selected && course?.year && course?.semester
    ).length;
  };
  
  // Helper function to get selected courses data
  const getSelectedCoursesData = (selectedCoursesMap) => {
    // Convert the selected courses map to an array of course objects
    const selectedArray = [];
    
    // Go through each course in the selection state
    Object.entries(selectedCoursesMap).forEach(([courseId, selectionData]) => {
      // Only include courses that are fully selected (have year and semester)
      if (selectionData?.selected && selectionData?.year && selectionData?.semester) {
        // Find the original course data
        const courseData = courses.find(c => c.id === courseId);
        if (courseData) {
          selectedArray.push({
            ...courseData,
            year: selectionData.year,
            semester: selectionData.semester
          });
        }
      }
    });
    
    return selectedArray;
  };
  
  // Function to notify parent of changes
  const notifyParent = (selectedCoursesMap) => {
    const completedCount = countCompletedSelections(selectedCoursesMap);
    const selectedCoursesData = getSelectedCoursesData(selectedCoursesMap);
    onSelectionChange?.(completedCount, selectedCoursesData);
  };

  // Handle checkbox change
  const handleSelectCourse = (courseId) => {
    // Check if we're already at the required count and trying to add more
    const currentCount = countCompletedSelections(selectedCourses);
    const isCurrentlySelected = selectedCourses[courseId]?.selected;

    // If we're already at the required count and trying to add a new one, prevent it
    if (currentCount >= requiredCount && !isCurrentlySelected) {
      return;
    }
    
    setSelectedCourses(prev => {
      const newState = {
        ...prev,
        [courseId]: {
          ...prev[courseId],
          selected: !prev[courseId]?.selected
        }
      };
      
      // If deselecting, also reset the year and semester
      if (!newState[courseId].selected) {
        newState[courseId].year = null;
        newState[courseId].semester = null;
      }
      
      // Notify parent of selection count and data
      notifyParent(newState);
      
      return newState;
    });
  };

  // Handle year selection change
  const handleYearChange = (courseId, year) => {
    setSelectedCourses(prev => {
      const newState = {
        ...prev,
        [courseId]: {
          ...prev[courseId],
          year,
          selected: prev[courseId]?.selected || false
        }
      };
      
      // Notify parent of selection count and data
      notifyParent(newState);
      
      return newState;
    });
  };

  // Handle semester selection change
  const handleSemesterChange = (courseId, semester) => {
    setSelectedCourses(prev => {
      const newState = {
        ...prev,
        [courseId]: {
          ...prev[courseId],
          semester,
          selected: prev[courseId]?.selected || false
        }
      };
      
      // Notify parent of selection count and data
      notifyParent(newState);
      
      return newState;
    });
  };

  // Handle using prescribed schedule
  const handleUsePrescribed = (courseId, course) => {
    const prescribedYear = course.year !== undefined ? course.year : (course.prescribed_year || null);
    const prescribedSemester = course.sem !== undefined ? course.sem : 
                             (course.semester !== undefined ? course.semester : (course.prescribed_semester || null));
    
    // Only apply if both year and semester are available
    if (prescribedYear !== null && prescribedSemester !== null && 
        prescribedYear !== '0' && prescribedYear !== 0 && 
        prescribedSemester !== '0' && prescribedSemester !== 0) {
      
      setSelectedCourses(prev => {
        const newState = {
          ...prev,
          [courseId]: {
            ...prev[courseId],
            year: prescribedYear,
            semester: prescribedSemester,
            selected: true
          }
        };
        
        // Notify parent of selection count and data
        notifyParent(newState);
        
        return newState;
      });
    }
  };
  
  // Reset all selections
  const handleResetAll = () => {
    setSelectedCourses({});
    notifyParent({});
  };

  // Helper function to check if a course is partially selected
  const isPartiallySelected = (courseId) => {
    const course = selectedCourses[courseId];
    return course?.selected && (!course?.year || !course?.semester);
  };

  // Check if a course has a valid prescribed schedule
  const hasPrescribedSchedule = (course) => {
    const prescribedYear = course.year !== undefined ? course.year : (course.prescribed_year || null);
    const prescribedSemester = course.sem !== undefined ? course.sem : 
                             (course.semester !== undefined ? course.semester : (course.prescribed_semester || null));
    
    return prescribedYear !== null && prescribedSemester !== null && 
           prescribedYear !== '0' && prescribedYear !== 0 && 
           prescribedSemester !== '0' && prescribedSemester !== 0;
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => {
    if (!searchQuery) return true;
    return course.course_code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Check if we've reached the required count 
  const hasReachedRequiredCount = countCompletedSelections(selectedCourses) >= requiredCount;

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No major courses available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search box */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search course code"
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Selection status and warning */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="px-2 py-1 bg-gray-100 rounded-md text-sm font-medium">
            {countCompletedSelections(selectedCourses)}/{requiredCount}
          </div>
        </div>
        
        {countCompletedSelections(selectedCourses) < requiredCount && (
          <div className="text-amber-600 text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span>Please select {requiredCount} courses to continue</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {filteredCourses.map((course) => {
          // Check if this course is selectable (either already selected or we haven't reached the limit)
          const isSelectable = selectedCourses[course.id]?.selected || !hasReachedRequiredCount;
          
          return (
            <Card 
              key={course.id} 
              className={`overflow-hidden ${isSelectable ? 'cursor-pointer' : 'opacity-60'} ${selectedCourses[course.id]?.selected ? 'border-blue-500' : ''}`}
              onClick={() => isSelectable && handleSelectCourse(course.id)}
            >
              <CardContent className="p-0">
                <div className="flex items-start">
                  <div className="flex items-start p-3 flex-grow">
                    <div className="flex-shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        id={`course-${course.id}`}
                        checked={selectedCourses[course.id]?.selected || false}
                        onCheckedChange={() => isSelectable && handleSelectCourse(course.id)}
                        disabled={!isSelectable}
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <CourseItem course={course} type="major" />
                      
                      {/* Notification for incomplete selection */}
                      {isPartiallySelected(course.id) && (
                        <div className="mt-2 text-xs flex items-center text-amber-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          <span>Please select both year and semester to complete this selection</span>
                        </div>
                      )}
                    </div>
                    <div 
                      className="flex-shrink-0 ml-2 pl-3 border-l" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Year and Semester selection in a column */}
                      <div className="space-y-2">
                        <Select
                          value={selectedCourses[course.id]?.year || ""}
                          onValueChange={(value) => handleYearChange(course.id, value)}
                          disabled={!selectedCourses[course.id]?.selected}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1st Year</SelectItem>
                            <SelectItem value="2">2nd Year</SelectItem>
                            <SelectItem value="3">3rd Year</SelectItem>
                            <SelectItem value="4">4th Year</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={selectedCourses[course.id]?.semester || ""}
                          onValueChange={(value) => handleSemesterChange(course.id, value)}
                          disabled={!selectedCourses[course.id]?.selected}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Semester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1st Sem</SelectItem>
                            <SelectItem value="2">2nd Sem</SelectItem>
                            <SelectItem value="M">Mid Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SelectMajors; 