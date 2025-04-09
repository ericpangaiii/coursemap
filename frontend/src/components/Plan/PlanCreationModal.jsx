import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Trash2, 
  Info, 
  SearchX, 
  Check, 
  ChevronDown, 
  AlertTriangle, 
  FileCheck,
  ArrowUpDown
} from "lucide-react";
import { curriculumsAPI } from "@/lib/api";
import CourseItem from "@/components/CourseItem";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCourseTypeColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { plansAPI } from "@/lib/api";

// Step components
const GEElectivesStep = ({ courses = [], onCourseSelect, selectedCourse, planData, stats, courseIdsInPlan }) => {
  const selectedCount = Object.values(planData)
    .flatMap(yearData => Object.values(yearData))
    .flatMap(semData => semData)
    .filter(c => c.course_type === 'ge_elective' || c.course_type === 'ge' || c.course_type === 'ge elective')
    .length;

  const isMaxReached = selectedCount >= stats.total;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">GE Electives</h3>
          <div className={`ml-2 px-2 py-1 ${isMaxReached ? 'bg-green-100 text-green-800' : 'bg-gray-100'} rounded-md text-sm font-medium`}>
            {selectedCount}/{stats.total}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Choose {stats.total} from {stats.available} available options
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-4 p-1 pt-0">
            {courses.length > 0 ? (
              courses.map((course, index) => {
                // Regular course check
                const isInPlan = courseIdsInPlan.has(course.course_id) || 
                  (course.combined_courses && 
                   course.combined_courses.some(c => courseIdsInPlan.has(c.course_id)));
                
                // Enhanced selection check
                const isSelected = selectedCourse && selectedCourse.course_id === course.course_id;
                
                const isDisabled = isInPlan || (isMaxReached && !isSelected);
                
                return (
                  <div
                    key={`${course.course_id}-${index}`}
                    className="w-[450px]"
                  >
                    <button
                      onClick={() => {
                        if (!isDisabled) {
                          if (isSelected) {
                            onCourseSelect(null);
                          } else {
                            onCourseSelect(course);
                          }
                        }
                      }}
                      className={`w-full text-left relative rounded-lg overflow-hidden
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                      disabled={isDisabled}
                    >
                      <CourseItemWithPlacement 
                        course={course}
                        type="ge_elective"
                        planData={planData}
                      />
                      {isSelected && !isInPlan && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                          <div className="h-3 w-3 flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        </div>
                      )}
                      {isInPlan && (
                        <div className="absolute inset-0 flex items-center justify-end pr-4">
                          <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                            Already in plan
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 min-h-[300px]">
                <SearchX className="h-12 w-12 mb-3" />
                <p className="text-sm font-medium">No courses found</p>
                <p className="text-sm">Try adjusting your search query</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

const ElectivesStep = ({ courses = [], onCourseSelect, selectedCourse, planData, stats, courseIdsInPlan }) => {
  const selectedCount = Object.values(planData)
    .flatMap(yearData => Object.values(yearData))
    .flatMap(semData => semData)
    .filter(c => c.course_type === 'elective')
    .length;

  const isMaxReached = selectedCount >= stats.total;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">Electives</h3>
          <div className={`ml-2 px-2 py-1 ${isMaxReached ? 'bg-green-100 text-green-800' : 'bg-gray-100'} rounded-md text-sm font-medium`}>
            {selectedCount}/{stats.total}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Choose {stats.total} from {stats.available} available options
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-4 p-1 pt-0">
            {courses.length > 0 ? (
              courses.map((course, index) => {
                // Regular course check
                const isInPlan = courseIdsInPlan.has(course.course_id) || 
                  (course.combined_courses && 
                   course.combined_courses.some(c => courseIdsInPlan.has(c.course_id)));
                
                // Enhanced selection check
                const isSelected = selectedCourse && selectedCourse.course_id === course.course_id;
                
                const isDisabled = isInPlan || (isMaxReached && !isSelected);
                
                return (
                  <div
                    key={`${course.course_id}-${index}`}
                    className="w-[450px]"
                  >
                    <button
                      onClick={() => {
                        if (!isDisabled) {
                          if (isSelected) {
                            onCourseSelect(null);
                          } else {
                            onCourseSelect(course);
                          }
                        }
                      }}
                      className={`w-full text-left relative rounded-lg overflow-hidden
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                      disabled={isDisabled}
                    >
                      <CourseItemWithPlacement 
                        course={course}
                        type="elective"
                        planData={planData}
                      />
                      {isSelected && !isInPlan && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                          <div className="h-3 w-3 flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        </div>
                      )}
                      {isInPlan && (
                        <div className="absolute inset-0 flex items-center justify-end pr-4">
                          <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                            Already in plan
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 min-h-[300px]">
                <SearchX className="h-12 w-12 mb-3" />
                <p className="text-sm font-medium">No courses found</p>
                <p className="text-sm">Try adjusting your search query</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

const MajorsStep = ({ courses = [], onCourseSelect, selectedCourse, planData, stats, courseIdsInPlan }) => {
  const selectedCount = Object.values(planData)
    .flatMap(yearData => Object.values(yearData))
    .flatMap(semData => semData)
    .filter(c => c.course_type === 'major')
    .length;

  const isMaxReached = selectedCount >= stats.total;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">Major Courses</h3>
          <div className={`ml-2 px-2 py-1 ${isMaxReached ? 'bg-green-100 text-green-800' : 'bg-gray-100'} rounded-md text-sm font-medium`}>
            {selectedCount}/{stats.total}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {stats.total} required major courses
        </p>
        {/* Completion message moved to PlanOverview */}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-4 p-1 pt-0">
            {courses.length > 0 ? (
              courses.map((course, index) => {
                // Regular course check
                const isInPlan = courseIdsInPlan.has(course.course_id) || 
                  (course.combined_courses && 
                   course.combined_courses.some(c => courseIdsInPlan.has(c.course_id)));
                
                // Enhanced selection check
                const isSelected = selectedCourse && selectedCourse.course_id === course.course_id;
                
                const isDisabled = isInPlan || (isMaxReached && !isSelected);
                
                return (
                  <div
                    key={`${course.course_id}-${index}`}
                    className="w-[450px]"
                  >
                    <button
                      onClick={() => {
                        if (!isDisabled) {
                          if (isSelected) {
                            onCourseSelect(null);
                          } else {
                            onCourseSelect(course);
                          }
                        }
                      }}
                      className={`w-full text-left relative rounded-lg overflow-hidden
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                      disabled={isDisabled}
                    >
                      <CourseItemWithPlacement 
                        course={course}
                        type="major"
                        planData={planData}
                      />
                      {isSelected && !isInPlan && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                          <div className="h-3 w-3 flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        </div>
                      )}
                      {isInPlan && (
                        <div className="absolute inset-0 flex items-center justify-end pr-4">
                          <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                            Already in plan
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 min-h-[300px]">
                <SearchX className="h-12 w-12 mb-3" />
                <p className="text-sm font-medium">No courses found</p>
                <p className="text-sm">Try adjusting your search query</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

const RequiredAcademicStep = ({ 
  courses = [], 
  onCourseSelect, 
  selectedCourse, 
  planData, 
  stats, 
  courseIdsInPlan,
  setPlanData,
  setPendingHKCourses 
}) => {
  const selectedCount = Object.values(planData)
    .flatMap(yearData => Object.values(yearData))
    .flatMap(semData => semData)
    .filter(c => c.course_type === 'required_academic' || 
      (c.course_type === 'required' && c.is_academic))
    .length;

  const isMaxReached = selectedCount >= stats.total;
  const courseType = 'required_academic';

  // Function to automatically assign all courses
  const handleAssignAll = () => {
    console.log("Starting handleAssignAll for", courseType, "with", courses.length, "courses");
    
    // Separate HIST 1/KAS 1 courses and regular courses
    const regularCourses = [];
    const histKasCourses = [];
    
    courses.forEach(course => {
      if (course.course_code === "HIST 1/KAS 1") {
        const key = `${course.course_id}-${course.prescribed_year}-${course.prescribed_semester}`;
        if (!courseIdsInPlan.has(course.course_id)) {
          histKasCourses.push(course);
        }
      } else {
        let isInPlan = courseIdsInPlan.has(course.course_id) || 
          (course.combined_courses && 
           course.combined_courses.some(c => courseIdsInPlan.has(c.curriculum_course_id)));
        
        if (!isInPlan) {
          regularCourses.push(course);
        }
      }
    });
    
    console.log("Found", regularCourses.length, "regular courses and", histKasCourses.length, "HIST 1/KAS 1 courses to assign");
    
    // Set all HIST 1/KAS 1 courses as pending
    setPendingHKCourses(histKasCourses);
    
    // Start with regular courses
    setPlanData(prevPlanData => {
      const newPlanData = {...prevPlanData};
      let assignedCount = 0;
      
      for (const course of regularCourses) {
        // Get year and semester from the course's prescribed data
        const year = course.prescribed_year || course.year;
        const semesterNum = course.prescribed_semester || course.semester || course.sem;
        
        console.log(`Attempting to assign ${course.course_code} to Year ${year}, Semester ${semesterNum}`);
        
        if (!year || !semesterNum) {
          console.log(`Skipping ${course.course_code} - missing year or semester info`);
          continue; // Skip if no placement info
        }
        
        // Convert semester number to name
        const semName = semesterNum === "1" ? "1st Sem" : 
                      semesterNum === "2" ? "2nd Sem" : 
                      semesterNum === "3" ? "Mid Year" : `Semester ${semesterNum}`;
        
        // Initialize the arrays if needed
        if (!newPlanData[year]) newPlanData[year] = {};
        if (!newPlanData[year][semName]) newPlanData[year][semName] = [];
        
        // Check if already exists
        const exists = newPlanData[year][semName].some(c => c.course_id === course.course_id);
        if (!exists) {
          // Add with proper type
          console.log(`Adding ${course.course_code} to Year ${year}, ${semName}`);
          newPlanData[year][semName].push({
            ...course,
            course_type: courseType
          });
          assignedCount++;
        } else {
          console.log(`${course.course_code} already exists in Year ${year}, ${semName}`);
        }
      }
      
      // Sort the courses in all semesters after all have been added
      for (const year in newPlanData) {
        for (const sem in newPlanData[year]) {
          newPlanData[year][sem].sort((a, b) => {
            // Academic before non-academic
            if (a.course_type === 'required_non_academic' && b.course_type !== 'required_non_academic') return 1;
            if (a.course_type !== 'required_non_academic' && b.course_type === 'required_non_academic') return -1;
            
            // Sort by course code
            const aCode = a.course_code.replace(/\s+/g, '');
            const bCode = b.course_code.replace(/\s+/g, '');
            
            return aCode.localeCompare(bCode);
          });
        }
      }
      
      console.log(`Successfully assigned ${assignedCount} regular courses of type ${courseType}`);
      
      // Trigger the first HIST 1/KAS 1 course selection if any exist
      if (histKasCourses.length > 0) {
        console.log("Starting HIST 1/KAS 1 course selections");
        onCourseSelect(histKasCourses[0]);
      }
      
      return newPlanData;
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold">Required Academic</h3>
            <div className={`ml-2 px-2 py-1 ${isMaxReached ? 'bg-green-100 text-green-800' : 'bg-gray-100'} rounded-md text-sm font-medium`}>
              {selectedCount}/{stats.total}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAssignAll}
            className="h-8 px-2 text-gray-500 hover:text-blue-600"
            disabled={isMaxReached}
          >
            <Check className="w-4 h-4 mr-1" />
            Auto Assign
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {stats.total} required academic courses
        </p>
        {/* Completion message moved to PlanOverview */}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-4 p-1 pt-0">
            {courses.length > 0 ? (
              courses.map((course, index) => {
                // Regular course check
                const isInPlan = courseIdsInPlan.has(course.course_id) || 
                  (course.combined_courses && 
                   course.combined_courses.some(c => courseIdsInPlan.has(c.course_id)));
                
                // Enhanced selection check
                const isSelected = selectedCourse && selectedCourse.course_id === course.course_id;
                
                const isDisabled = isInPlan || (isMaxReached && !isSelected);
                
                return (
                  <div
                    key={`${course.course_id}-${index}`}
                    className="w-[450px]"
                  >
                    <button
                      onClick={() => {
                        if (!isDisabled) {
                          if (isSelected) {
                            onCourseSelect(null);
                          } else {
                            onCourseSelect(course);
                          }
                        }
                      }}
                      className={`w-full text-left relative rounded-lg overflow-hidden
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                      disabled={isDisabled}
                    >
                      <CourseItemWithPlacement 
                        course={course}
                        type="required_academic"
                        planData={planData}
                      />
                      {isSelected && !isInPlan && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                          <div className="h-3 w-3 flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        </div>
                      )}
                      {isInPlan && (
                        <div className="absolute inset-0 flex items-center justify-end pr-4">
                          <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                            Already in plan
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 min-h-[300px]">
                <SearchX className="h-12 w-12 mb-3" />
                <p className="text-sm font-medium">No courses found</p>
                <p className="text-sm">Try adjusting your search query</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

const RequiredNonAcademicStep = ({ 
  courses = [], 
  onCourseSelect, 
  selectedCourse, 
  planData, 
  stats, 
  courseIdsInPlan, 
  setPlanData,
  setPendingHKCourses 
}) => {
  const selectedCount = Object.values(planData)
    .flatMap(yearData => Object.values(yearData))
    .flatMap(semData => semData)
    .filter(c => c.course_type === 'required_non_academic' || 
      (c.course_type === 'required' && !c.is_academic))
    .length;

  const isMaxReached = selectedCount >= stats.total;
  const courseType = 'required_non_academic'; // Define courseType locally

  // Function to automatically assign all courses
  const handleAssignAll = () => {
    console.log("Starting handleAssignAll for", courseType, "with", courses.length, "courses");
    
    // Separate HK 12/13 courses and regular courses
    const regularCourses = [];
    const hk1213Courses = [];
    
    courses.forEach(course => {
      if (course.course_code === "HK 12/13") {
        const key = `${course.course_id}-${course.prescribed_year}-${course.prescribed_semester}`;
        // Use courseIdsInPlan directly from props
        if (!courseIdsInPlan.hk1213Courses.has(key)) {
          hk1213Courses.push(course);
        }
      } else {
        let isInPlan = courseIdsInPlan.has(course.course_id) || 
          (course.combined_courses && 
           course.combined_courses.some(c => courseIdsInPlan.has(c.curriculum_course_id)));
        
        if (!isInPlan) {
          regularCourses.push(course);
        }
      }
    });
    
    console.log("Found", regularCourses.length, "regular courses and", hk1213Courses.length, "HK 12/13 courses to assign");
    
    // Set all HK 12/13 courses as pending
    setPendingHKCourses(hk1213Courses);
    
    // Start with regular courses
    setPlanData(prevPlanData => {
      const newPlanData = {...prevPlanData};
      let assignedCount = 0;
      
      for (const course of regularCourses) {
        // Get year and semester from the course's prescribed data
        const year = course.prescribed_year || course.year;
        const semesterNum = course.prescribed_semester || course.semester || course.sem;
        
        console.log(`Attempting to assign ${course.course_code} to Year ${year}, Semester ${semesterNum}`);
        
        if (!year || !semesterNum) {
          console.log(`Skipping ${course.course_code} - missing year or semester info`);
          continue; // Skip if no placement info
        }
        
        // Convert semester number to name
        const semName = semesterNum === "1" ? "1st Sem" : 
                      semesterNum === "2" ? "2nd Sem" : 
                      semesterNum === "3" ? "Mid Year" : `Semester ${semesterNum}`;
        
        // Initialize the arrays if needed
        if (!newPlanData[year]) newPlanData[year] = {};
        if (!newPlanData[year][semName]) newPlanData[year][semName] = [];
        
        // Check if already exists
        const exists = newPlanData[year][semName].some(c => c.course_id === course.course_id);
        if (!exists) {
          // Add with proper type
          console.log(`Adding ${course.course_code} to Year ${year}, ${semName}`);
          newPlanData[year][semName].push({
            ...course,
            course_type: courseType
          });
          assignedCount++;
        } else {
          console.log(`${course.course_code} already exists in Year ${year}, ${semName}`);
        }
      }
      
      // Sort the courses in all semesters after all have been added
      for (const year in newPlanData) {
        for (const sem in newPlanData[year]) {
          newPlanData[year][sem].sort((a, b) => {
            // Academic before non-academic
            if (a.course_type === 'required_non_academic' && b.course_type !== 'required_non_academic') return 1;
            if (a.course_type !== 'required_non_academic' && b.course_type === 'required_non_academic') return -1;
            
            // Sort by course code
            const aCode = a.course_code.replace(/\s+/g, '');
            const bCode = b.course_code.replace(/\s+/g, '');
            
            return aCode.localeCompare(bCode);
          });
        }
      }
      
      console.log(`Successfully assigned ${assignedCount} regular courses of type ${courseType}`);
      
      // Trigger the first HK 12/13 course selection if any exist
      if (hk1213Courses.length > 0) {
        console.log("Starting HK 12/13 course selections");
        onCourseSelect(hk1213Courses[0]);
      }
      
      return newPlanData;
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold">Required Non-Academic</h3>
            <div className={`ml-2 px-2 py-1 ${isMaxReached ? 'bg-green-100 text-green-800' : 'bg-gray-100'} rounded-md text-sm font-medium`}>
              {selectedCount}/{stats.total}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAssignAll}
            className="h-8 px-2 text-gray-500 hover:text-blue-600"
            disabled={isMaxReached}
          >
            <Check className="w-4 h-4 mr-1" />
            Auto Assign
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {stats.total} required non-academic courses
        </p>
        {/* Completion message moved to PlanOverview */}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-4 p-1 pt-0">
            {courses.length > 0 ? (
              courses.map((course, index) => {
                // Special handling for HK 12/13 courses
                let isInPlan = false;
                if (course.course_code === "HK 12/13") {
                  // Check if either of the combined courses exists in the plan using curriculum_course_id
                  isInPlan = course.combined_courses && course.combined_courses.some(c => 
                    courseIdsInPlan.has(c.curriculum_course_id)
                  );
                } else {
                  // For regular courses
                  isInPlan = courseIdsInPlan.has(course.course_id) || 
                    (course.combined_courses && 
                     course.combined_courses.some(c => courseIdsInPlan.has(c.curriculum_course_id)));
                }

                // Enhanced selection check
                const isSelected = selectedCourse && selectedCourse.course_id === course.course_id;
                
                const isDisabled = isInPlan || (isMaxReached && !isSelected);
                
                return (
                  <div
                    key={`${course.course_id}-${index}`}
                    className="w-[450px]"
                  >
                    <button
                      onClick={() => {
                        if (!isDisabled) {
                          if (isSelected) {
                            onCourseSelect(null);
                          } else {
                            onCourseSelect(course);
                          }
                        }
                      }}
                      className={`w-full text-left relative rounded-lg overflow-hidden
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                      disabled={isDisabled}
                    >
                      <CourseItemWithPlacement 
                        course={course}
                        type="required_non_academic"
                        planData={planData}
                      />
                      {isSelected && !isInPlan && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                          <div className="h-3 w-3 flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        </div>
                      )}
                      {isInPlan && (
                        <div className="absolute inset-0 flex items-center justify-end pr-4">
                          <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                            Already in plan
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 min-h-[300px]">
                <SearchX className="h-12 w-12 mb-3" />
                <p className="text-sm font-medium">No courses found</p>
                <p className="text-sm">Try adjusting your search query</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

// Move generateWarnings function outside of SummaryStep component
const generateWarnings = (planData) => {
  const warnings = [];
  
  // Check for overload and underload in academic units (exclude required_non_academic)
  Object.entries(planData).forEach(([year, yearData]) => {
    Object.entries(yearData).forEach(([sem, courses]) => {
      const academicUnits = courses.reduce((total, course) => {
        // Only count academic courses' units
        if (course.course_type !== 'required_non_academic') {
          return total + (parseInt(course.units) || 0);
        }
        return total;
      }, 0);
      
      const yearText = year === "1" ? "1st Year" : year === "2" ? "2nd Year" : year === "3" ? "3rd Year" : `${year}th Year`;
      
      // Check for overload/underload based on semester
      if (sem === "Mid Year") {
        // For midyear, min is 0 and max is 6 units
        if (academicUnits > 6 && academicUnits > 0) {
          warnings.push({
            text: `${yearText}, ${sem}: Overload`,
            details: `${academicUnits} units (max 6)`
          });
        }
      } else {
        // For regular semesters
        if (academicUnits > 18) {
          warnings.push({
            text: `${yearText}, ${sem}: Overload`,
            details: `${academicUnits} units (max 18)`
          });
        } else if (academicUnits < 15 && academicUnits > 0) {
          warnings.push({
            text: `${yearText}, ${sem}: Underload`,
            details: `${academicUnits} units (min 15)`
          });
        }
      }
    });
  });
  
  return warnings;
};

// Update the SummaryStep component to use the moved function
const SummaryStep = ({ planData }) => {
  const [warningsExpanded, setWarningsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState("by-type"); // "by-type" or "by-semester"
  
  const warnings = generateWarnings(planData);
  
  const calculateTypeStats = () => {
    const stats = {
      ge_elective: { count: 0, units: 0 },
      elective: { count: 0, units: 0 },
      major: { count: 0, units: 0 },
      required_academic: { count: 0, units: 0 },
      required_non_academic: { count: 0, units: 0 }
    };

    Object.values(planData).forEach(yearData => {
      Object.values(yearData).forEach(semData => {
        semData.forEach(course => {
          const type = course.course_type;
          if (stats[type]) {
            stats[type].count++;
            stats[type].units += parseInt(course.units || 0, 10);
          }
        });
      });
    });

    return stats;
  };

  const stats = calculateTypeStats();
  
  // Calculate total courses by year and semester
  const semesterBreakdown = {};
  Object.entries(planData).forEach(([year, yearData]) => {
    semesterBreakdown[year] = {};
    Object.entries(yearData).forEach(([sem, courses]) => {
      const academicUnits = courses.reduce((total, course) => {
        if (course.course_type !== 'required_non_academic') {
          return total + (parseInt(course.units) || 0);
        }
        return total;
      }, 0);
      
      const nonAcademicUnits = courses.reduce((total, course) => {
        if (course.course_type === 'required_non_academic') {
          return total + (parseInt(course.units) || 0);
        }
        return total;
      }, 0);
      
      semesterBreakdown[year][sem] = {
        academicCourses: courses.filter(c => c.course_type !== 'required_non_academic').length,
        academicUnits,
        nonAcademicCourses: courses.filter(c => c.course_type === 'required_non_academic').length,
        nonAcademicUnits,
        totalCourses: courses.length,
        totalUnits: academicUnits + nonAcademicUnits
      };
    });
  });
  
  // Calculate total counts (including non-academic)
  const totalUnits = Object.values(stats).reduce((sum, { units }) => sum + units, 0);
  const totalCourses = Object.values(stats).reduce((sum, { count }) => sum + count, 0);

  // Count non-academic units separately
  const nonAcademicUnits = stats.required_non_academic.units;
  const nonAcademicCount = stats.required_non_academic.count;

  const typeLabels = {
    ge_elective: "GE Electives",
    elective: "Electives",
    major: "Major Courses",
    required_academic: "Required Academic",
    required_non_academic: "Required Non-Academic"
  };

  // Filter out types with no courses
  const activeTypeEntries = Object.entries(stats)
    .filter(([type, { count }]) => type !== 'required_non_academic' && count > 0);
  
  // Calculate total for semester view
  let semTotalCourses = 0;
  let semTotalUnits = 0;
  Object.values(semesterBreakdown).forEach(yearData => {
    Object.values(yearData).forEach(data => {
      semTotalCourses += data.totalCourses;
      semTotalUnits += data.totalUnits;
    });
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h3 className="text-lg font-semibold">Plan Summary</h3>
        <p className="text-sm text-gray-500 mt-1">
          Review your course selections before finalizing your plan.
        </p>
      </div>
      
      {/* Simple button toggle instead of dropdown */}
      <div className="flex justify-end mb-2">
        <Button 
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-gray-500 hover:text-blue-600"
          onClick={() => setViewMode(viewMode === "by-type" ? "by-semester" : "by-type")}
        >
          <ArrowUpDown className="w-4 h-4 mr-1" />
          {viewMode === "by-type" ? "View By Semester" : "View By Course Type"}
        </Button>
      </div>
      
      {/* Summary Table Card - By Course Type */}
      {viewMode === "by-type" && (
        <Card className="p-4 mb-6 border border-gray-200">
          <ScrollArea className="h-[280px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Course Type</TableHead>
                  <TableHead className="text-center w-[100px]">Courses</TableHead>
                  <TableHead className="text-center w-[100px]">Units</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {/* Academic courses - only show types that have courses */}
                {activeTypeEntries.map(([type, { count, units }]) => (
                  <TableRow key={type}>
                    <TableCell className="w-[300px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-4 rounded ${getCourseTypeColor(type)}`} />
                        {typeLabels[type]}
                      </div>
                    </TableCell>
                    <TableCell className="text-center w-[100px]">{count}</TableCell>
                    <TableCell className="text-center w-[100px]">{units}</TableCell>
                  </TableRow>
                ))}
                
                {/* Required Non-Academic row */}
                {nonAcademicCount > 0 && (
                  <TableRow>
                    <TableCell className="w-[300px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-4 rounded ${getCourseTypeColor('required_non_academic')}`} />
                        {typeLabels['required_non_academic']}
                      </div>
                    </TableCell>
                    <TableCell className="text-center w-[100px]">{nonAcademicCount}</TableCell>
                    <TableCell className="text-center w-[100px]">{nonAcademicUnits}</TableCell>
                  </TableRow>
                )}
                
                {/* Total Units (with everything) */}
                <TableRow className="border-t-2 font-medium">
                  <TableCell className="w-[300px] font-bold">Total</TableCell>
                  <TableCell className="text-center w-[100px] font-bold">{totalCourses}</TableCell>
                  <TableCell className="text-center w-[100px] font-bold">{totalUnits}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}
      
      {/* Semester breakdown for a more detailed view */}
      {viewMode === "by-semester" && (
        <Card className="p-4 mb-6 border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead className="text-center">Courses</TableHead>
                <TableHead className="text-center">Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {/* Group semesters by year */}
              {Object.keys(semesterBreakdown).sort().map(year => {
                const yearText = year === "1" ? "1st Year" : year === "2" ? "2nd Year" : year === "3" ? "3rd Year" : `${year}th Year`;
                
                // Sort semesters in proper order: 1st Sem, 2nd Sem, Mid Year
                const semOrder = { "1st Sem": 1, "2nd Sem": 2, "Mid Year": 3 };
                const sortedSems = Object.keys(semesterBreakdown[year]).sort((a, b) => semOrder[a] - semOrder[b]);
                
                return sortedSems.map((sem, idx) => {
                  const data = semesterBreakdown[year][sem];
                  
                  return (
                    <TableRow key={`${year}-${sem}`}>
                      {idx === 0 ? (
                        <TableCell rowSpan={sortedSems.length}>
                          <div className="flex items-center gap-2">
                            <div className={`w-1 h-4 rounded ${year === "1" ? "bg-blue-300" : 
                                                    year === "2" ? "bg-green-300" : 
                                                    year === "3" ? "bg-purple-300" : 
                                                    "bg-orange-300"}`} />
                            {yearText}
                          </div>
                        </TableCell>
                      ) : null}
                      <TableCell>{sem}</TableCell>
                      <TableCell className="text-center">{data.totalCourses}</TableCell>
                      <TableCell className="text-center">{data.totalUnits}</TableCell>
                    </TableRow>
                  );
                });
              })}
              
              {/* Total row */}
              <TableRow className="border-t-2">
                <TableCell colSpan={2} className="font-bold">Total</TableCell>
                <TableCell className="text-center font-bold">{semTotalCourses}</TableCell>
                <TableCell className="text-center font-bold">{semTotalUnits}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* Warnings panel */}
      <Card className="border border-gray-200">
        <div 
          className="flex items-center justify-between p-3 cursor-pointer border-b border-gray-100"
          onClick={() => setWarningsExpanded(!warningsExpanded)}
        >
          <div className="flex items-center gap-2">
            {warnings.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            ) : (
              <Check className="h-4 w-4 text-green-500" />
            )}
            <h3 className="text-sm font-medium">Warnings</h3>
            {warnings.length > 0 && (
              <div className="bg-yellow-100 text-yellow-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                {warnings.length}
              </div>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${warningsExpanded ? 'rotate-180' : 'rotate-0'}`} />
        </div>
        
        {warningsExpanded && (
          <div className="p-3">
            {warnings.length > 0 ? (
              <div className="space-y-2">
                {warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-gray-700">
                    <p className="font-medium">{warning.text}</p>
                    <p className="text-gray-500">{warning.details}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-green-700">No issues detected with your current plan.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

// Overview component that shows the current plan state
const PlanOverview = ({ selectedCourse, onSemesterClick, planData, onRemoveCourse, onClear, coursesByType, getPrescribedSemestersForType, isReviewStep }) => {
  const years = [1, 2, 3, 4];
  const semesters = ["1st Sem", "2nd Sem", "Mid Year"];
  const [showFullCurriculum, setShowFullCurriculum] = useState(false);
  
  // Get all courses from the curriculum organized by year and semester
  const getCurriculumCourses = () => {
    const curriculumCourses = {};
    
    // Initialize all years and semesters with empty arrays
    years.forEach(year => {
      curriculumCourses[year] = {};
      semesters.forEach(sem => {
        curriculumCourses[year][sem] = [];
      });
    });

    // Helper to normalize semester format
    const normalizeSemester = (sem) => {
      if (sem === "1" || sem === 1) return "1st Sem";
      if (sem === "2" || sem === 2) return "2nd Sem";
      if (sem === "3" || sem === 3 || sem === "M" || sem === "m") return "Mid Year";
      return "1st Sem"; // Default to 1st semester if unknown
    };
    
    // 1. First add all specific courses from the curriculum
    if (coursesByType) {
      // Add required courses (academic and non-academic) which have specific course codes
      const typeMap = {
        'required_academic': 'required_academic',
        'required_non_academic': 'required_non_academic'
      };
      
      Object.entries(typeMap).forEach(([typeKey, courseType]) => {
        const courses = coursesByType[typeKey] || [];
        courses.forEach(course => {
          const prescribedYear = parseInt(course.year || course.prescribed_year || 1);
          const prescribedSem = normalizeSemester(course.sem || course.prescribed_semester || 1);
          
          // Only add if within our defined years and semesters
          if (prescribedYear >= 1 && prescribedYear <= 4 && semesters.includes(prescribedSem)) {
            curriculumCourses[prescribedYear][prescribedSem].push({
              ...course,
              // Explicitly set the course type to ensure proper coloring
              course_type: courseType,
              _isCurriculumCourse: true
            });
          }
        });
      });
      
      // 2. Add generic course type placeholders for GE, electives, and majors
      // These don't represent specific courses but indicate that a course of this type should be taken
      const typesToAddGeneric = ['ge_elective', 'elective', 'major'];
      
      typesToAddGeneric.forEach(type => {
        // Get semester information from the curriculum structure
        const semestersInfo = getPrescribedSemestersForType(type);
        
        semestersInfo.forEach(sem => {
          const year = parseInt(sem.year);
          const semester = normalizeSemester(sem.sem);
          const count = parseInt(sem.count || 1);
          
          // Only add if within our defined years and semesters
          if (year >= 1 && year <= 4 && semesters.includes(semester)) {
            // Add a placeholder for each required course of this type
            for (let i = 0; i < count; i++) {
              const typeLabel = type === 'ge_elective' ? 'GE Elective' : 
                               type === 'elective' ? 'Elective' : 
                               'Major';
              
              curriculumCourses[year][semester].push({
                course_id: `${type}_placeholder_${year}_${semester}_${i}`,
                course_code: typeLabel,
                course_type: type,
                _isCurriculumCourse: true,
                _isTypePlaceholder: true,
                title: `${typeLabel} (Required)`,
                prescribed_year: year,
                prescribed_semester: sem.sem
              });
            }
          }
        });
      });
    }
    
    return curriculumCourses;
  };
  
  // Get merged data of user plan and curriculum courses
  const getMergedData = () => {
    if (!showFullCurriculum) return planData;
    
    const curriculumCourses = getCurriculumCourses();
    const mergedData = JSON.parse(JSON.stringify(curriculumCourses));

    // First check if HIST 1/KAS 1 or HK 12/13 exists in the plan
    let hasHistKas = false;
    let hasHK = false;
    Object.values(planData).forEach(yearData => {
      Object.values(yearData).forEach(semData => {
        semData.forEach(course => {
          if (course.course_code === "HIST 1" || course.course_code === "KAS 1") {
            hasHistKas = true;
          }
          if (course.course_code === "HK 12" || course.course_code === "HK 13") {
            hasHK = true;
          }
        });
      });
    });

    // If HIST 1 or KAS 1 exists, remove HIST 1/KAS 1 curriculum courses
    if (hasHistKas) {
      Object.keys(mergedData).forEach(year => {
        Object.keys(mergedData[year]).forEach(sem => {
          mergedData[year][sem] = mergedData[year][sem].filter(course => 
            !(course._isCurriculumCourse && course.course_code === "HIST 1/KAS 1")
          );
        });
      });
    }

    // If HK 12 or HK 13 exists, remove HK 12/13 curriculum courses
    if (hasHK) {
      Object.keys(mergedData).forEach(year => {
        Object.keys(mergedData[year]).forEach(sem => {
          mergedData[year][sem] = mergedData[year][sem].filter(course => 
            !(course._isCurriculumCourse && course.course_code === "HK 12/13")
          );
        });
      });
    }
    
    // Merge user's plan into the curriculum data
    Object.entries(planData).forEach(([year, yearData]) => {
      Object.entries(yearData).forEach(([sem, courses]) => {
        // Convert year to number for proper indexing
        const yearNum = parseInt(year);
        
        // Only process if within our defined years and semesters
        if (yearNum >= 1 && yearNum <= 4 && semesters.includes(sem)) {
          // Add user's courses
          courses.forEach(course => {
            // If the course is already in the curriculum for this semester, remove it
            mergedData[yearNum][sem] = mergedData[yearNum][sem].filter(c => 
              c.course_id !== course.course_id
            );
            
            // Also remove one placeholder of matching type if it exists
            // This is for GE/elective/major placeholders
            const courseType = course.course_type;
            if (courseType === 'ge_elective' || courseType === 'elective' || courseType === 'major') {
              // Find index of first matching type placeholder
              const placeholderIndex = mergedData[yearNum][sem].findIndex(
                c => c._isTypePlaceholder && c.course_type === courseType
              );
              
              // Remove one placeholder if found
              if (placeholderIndex !== -1) {
                mergedData[yearNum][sem].splice(placeholderIndex, 1);
              }
            }
            
            // Add the user's course
            mergedData[yearNum][sem].push(course);
          });
        }
      });
    });
    
    return mergedData;
  };
  
  // Get data to display (either just plan or merged with curriculum)
  const displayData = getMergedData();
  
  // Return different CSS class for type placeholders vs regular courses
  const getCourseItemClass = (course) => {
    if (course._isTypePlaceholder) {
      return 'text-gray-400 italic font-normal';
    }
    return course._isCurriculumCourse ? 'text-gray-400 italic' : 'text-gray-600';
  };
  
  // Return appropriate color class - more transparent for curriculum courses
  const getCourseIndicatorClass = (course, colorType) => {
    const baseColor = getCourseTypeColor(colorType);
    if (course._isCurriculumCourse) {
      // Return a more transparent version of the color
      if (baseColor.includes('bg-yellow-500')) return 'bg-yellow-200';
      if (baseColor.includes('bg-blue-500')) return 'bg-blue-200';
      if (baseColor.includes('bg-blue-300')) return 'bg-blue-100';
      if (baseColor.includes('bg-purple-500')) return 'bg-purple-200';
      if (baseColor.includes('bg-red-500')) return 'bg-red-200';
      return 'bg-gray-200';
    }
    return baseColor;
  };

  // Check if this semester matches the selected course's prescribed schedule
  const isPrescribedSchedule = (year, sem) => {
    if (!selectedCourse) return false;
    
    // Normalize semester names to match data format
    const normalizedSem = 
      sem === "1st Sem" ? "1" : 
      sem === "2nd Sem" ? "2" : 
      sem === "Mid Year" ? "3" : sem;
    
    // Return false if a course of this type has already been added to this semester
    const semesterCourses = displayData[year]?.[sem] || [];
    const coursesOfType = semesterCourses.filter(course => 
      !course._isCurriculumCourse && course.course_type === selectedCourse.course_type
    );
    if (coursesOfType.length > 0) {
      return false;
    }
    
    // For courses with multiple prescribed semesters as an array (GE electives, electives, majors)
    if (selectedCourse.prescribed_note && Array.isArray(selectedCourse.prescribed_note)) {
      // Check if any of the prescribed semesters match the current semester
      return selectedCourse.prescribed_note.some(prescribedSemStr => {
        // Format is like "1st Year 1st Sem"
        // Extract the year number (1, 2, 3, 4, etc.)
        let prescribedYear = null;
        if (prescribedSemStr.includes("1st Year")) prescribedYear = "1";
        else if (prescribedSemStr.includes("2nd Year")) prescribedYear = "2";
        else if (prescribedSemStr.includes("3rd Year")) prescribedYear = "3";
        else if (prescribedSemStr.includes("4th Year")) prescribedYear = "4";
        else {
          const match = prescribedSemStr.match(/(\d+)th Year/);
          if (match) prescribedYear = match[1];
        }

        // Extract the semester (1, 2, 3/Mid Year)
        let prescribedSem = null;
        if (prescribedSemStr.includes("1st Sem")) prescribedSem = "1";
        else if (prescribedSemStr.includes("2nd Sem")) prescribedSem = "2";
        else if (prescribedSemStr.includes("Mid Year")) prescribedSem = "3";
        
        if (prescribedYear && prescribedSem) {
          return String(prescribedYear) === String(year) && prescribedSem === normalizedSem;
        }
        
        return false;
      });
    }
    
    // For courses with multiple prescribed semesters as a string (comma-separated)
    if (selectedCourse.prescribed_note && typeof selectedCourse.prescribed_note === 'string') {
      // Split the string by commas and check each part
      const prescribedSemesters = selectedCourse.prescribed_note.split(',');
      
      return prescribedSemesters.some(prescribedSemStr => {
        prescribedSemStr = prescribedSemStr.trim();
        
        // Format is like "1st Year 1st Sem"
        // Extract the year number (1, 2, 3, 4, etc.)
        let prescribedYear = null;
        if (prescribedSemStr.includes("1st Year")) prescribedYear = "1";
        else if (prescribedSemStr.includes("2nd Year")) prescribedYear = "2";
        else if (prescribedSemStr.includes("3rd Year")) prescribedYear = "3";
        else if (prescribedSemStr.includes("4th Year")) prescribedYear = "4";
        else {
          const match = prescribedSemStr.match(/(\d+)th Year/);
          if (match) prescribedYear = match[1];
        }

        // Extract the semester (1, 2, 3/Mid Year)
        let prescribedSem = null;
        if (prescribedSemStr.includes("1st Sem")) prescribedSem = "1";
        else if (prescribedSemStr.includes("2nd Sem")) prescribedSem = "2";
        else if (prescribedSemStr.includes("Mid Year")) prescribedSem = "3";
        
        if (prescribedYear && prescribedSem) {
          return String(prescribedYear) === String(year) && prescribedSem === normalizedSem;
        }
        
        return false;
      });
    }
    
    // For courses with a single prescribed semester (required academic/non-academic)
    const prescribedYear = selectedCourse.year !== undefined ? 
      selectedCourse.year : (selectedCourse.prescribed_year || null);
    const prescribedSemester = selectedCourse.sem !== undefined ? 
      selectedCourse.sem : (selectedCourse.semester !== undefined ? 
        selectedCourse.semester : (selectedCourse.prescribed_semester || null));
    
    // Compare with current semester
    return String(prescribedYear) === String(year) && String(prescribedSemester) === normalizedSem;
  };
  
  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-500">Overview</h3>
        </div>
        {!isReviewStep && (
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <span className="text-xs mr-2 text-gray-500">
                View Curriculum
              </span>
              <div 
                className={`relative inline-flex h-5 w-10 cursor-pointer rounded-full transition-colors ${showFullCurriculum ? 'bg-blue-500' : 'bg-gray-200'}`}
                onClick={() => setShowFullCurriculum(!showFullCurriculum)}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform absolute top-0.5 ${showFullCurriculum ? 'translate-x-5' : 'translate-x-1'}`} 
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-8 px-2 text-gray-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto">
        {years.map(year => {
          // Skip years with no courses if in summary step
          const hasCourses = semesters.some(sem => {
            const coursesInSem = displayData[year]?.[sem] || [];
            return coursesInSem.length > 0;
          });
          
          if (isReviewStep && !hasCourses) {
            return null;
          }
          
          return (
            <div key={year} className="space-y-2">
              <h4 className="text-sm font-medium">{year === 1 ? "1st" : year === 2 ? "2nd" : year === 3 ? "3rd" : "4th"} Year</h4>
              <div className="grid grid-cols-3 gap-2">
                {semesters.map(sem => {
                  const coursesInSem = displayData[year]?.[sem] || [];
                  const hasContent = coursesInSem.length > 0;
                  const isPrescribed = isPrescribedSchedule(year, sem);
                  
                  // Skip empty semesters in summary step
                  if (isReviewStep && !hasContent) {
                    return null;
                  }
                  
                  // Calculate academic units for this semester
                  const academicUnits = coursesInSem.reduce((total, course) => {
                    if (course.course_type !== 'required_non_academic') {
                      return total + (parseInt(course.units) || 0);
                    }
                    return total;
                  }, 0);

                  // Check for warnings in this semester
                  const semesterWarnings = [];
                  if (isReviewStep) {
                    if (sem === "Mid Year") {
                      if (academicUnits > 6 && academicUnits > 0) {
                        semesterWarnings.push({
                          text: "Overload",
                          details: `${academicUnits} units (max 6)`
                        });
                      }
                    } else {
                      if (academicUnits > 18) {
                        semesterWarnings.push({
                          text: "Overload",
                          details: `${academicUnits} units (max 18)`
                        });
                      } else if (academicUnits < 15 && academicUnits > 0) {
                        semesterWarnings.push({
                          text: "Underload",
                          details: `${academicUnits} units (min 15)`
                        });
                      }
                    }
                  }
                  
                  return (
                    <div key={sem} className="relative">
                      <div
                        onClick={() => selectedCourse && onSemesterClick(year, sem)}
                        className={`w-full border rounded p-2 text-left transition-colors relative min-h-[4rem] flex flex-col
                          ${selectedCourse ? 'hover:border-blue-300 cursor-pointer' : ''}
                          ${hasContent && !isPrescribed ? 'bg-gray-50' : ''}
                          ${isPrescribed ? 'bg-blue-50 border-blue-300' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-medium ${isPrescribed ? 'text-blue-600' : 'text-gray-500'}`}>{sem}</p>
                          {hasContent && isReviewStep && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center">
                                    {semesterWarnings.length > 0 ? (
                                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    ) : (
                                      <Check className="w-4 h-4 text-green-500" />
                                    )}
                                  </div>
                                </TooltipTrigger>
                                {semesterWarnings.length > 0 && (
                                  <TooltipContent className="bg-white border border-gray-200 shadow-lg p-2">
                                    <div className="space-y-1">
                                      {semesterWarnings.map((warning, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                          <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                                          <div>
                                            <p className="text-xs font-medium text-gray-700">{warning.text}</p>
                                            <p className="text-xs text-gray-500">{warning.details}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        
                        {hasContent ? (
                          <div className="space-y-1 mt-1 flex-1 flex flex-col">
                            <div className="flex-1 space-y-1">
                              {coursesInSem.sort((a, b) => {
                                if (a.course_type === 'required_non_academic' && b.course_type !== 'required_non_academic') return 1;
                                if (a.course_type !== 'required_non_academic' && b.course_type === 'required_non_academic') return -1;
                                return 0;
                              }).map((course, idx) => {
                                let colorType = course.course_type;
                                if (colorType === 'required_academic') colorType = 'academic';
                                if (colorType === 'required_non_academic') colorType = 'non_academic';
                                if (colorType === 'ge_elective') colorType = 'ge';
                                
                                return (
                                  <div key={idx} className="flex items-center group">
                                    <div 
                                      className={`w-1 h-4 rounded-full mr-1.5 ${getCourseIndicatorClass(course, colorType)}`}
                                    />
                                    <p className={`text-xs truncate flex-1 ${getCourseItemClass(course)}`}>
                                      {course.course_code}
                                    </p>
                                    {!course._isCurriculumCourse && !isReviewStep && (
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onRemoveCourse(year, sem, idx, course);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded transition-opacity cursor-pointer"
                                      >
                                        <Trash2 className="h-3 w-3 text-red-500" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            
                            <div className="flex justify-end mt-auto pt-1.5 gap-1 text-[10px] font-normal">
                              <span className={`${isPrescribed ? 'text-blue-600' : 'text-gray-500'}`}>
                                {coursesInSem.reduce((total, course) => {
                                  if (!course._isCurriculumCourse && course.course_type !== 'required_non_academic') {
                                    return total + (parseInt(course.units) || 0);
                                  }
                                  return total;
                                }, 0)} units
                              </span>
                              
                              {showFullCurriculum && coursesInSem.some(c => c._isCurriculumCourse) && (
                                <span className="text-gray-400 italic">
                                  ({coursesInSem.reduce((total, course) => {
                                    if (course._isCurriculumCourse && course.course_type !== 'required_non_academic') {
                                      if (course.units) {
                                        return total + (parseInt(course.units) || 0);
                                      }
                                      else if (course._isTypePlaceholder) {
                                        if (course.course_type === 'ge_elective') return total + 3;
                                        if (course.course_type === 'elective') return total + 3;
                                        if (course.course_type === 'major') return total + 3;
                                      }
                                    }
                                    return total;
                                  }, 0)})
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className={`text-xs mt-1 ${isPrescribed ? 'text-blue-400' : 'text-gray-400'}`}>Empty</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Main modal component
const PlanCreationModal = ({ 
  open, 
  onOpenChange, 
  onPlanCreated 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coursesByType, setCoursesByType] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [planData, setPlanData] = useState({});
  const [curriculumStructure, setCurriculumStructure] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCombinedCourseDialog, setShowCombinedCourseDialog] = useState(false);
  const [combinedCourseOptions, setCombinedCourseOptions] = useState(null);
  const [pendingHKCourses, setPendingHKCourses] = useState([]);
  
  // Fetch courses and curriculum structure on mount
  useEffect(() => {
    const fetchData = async () => {
        try {
          setLoading(true);
        const [coursesData, structureData] = await Promise.all([
          curriculumsAPI.getCurrentCurriculumCourses(),
          curriculumsAPI.getCurrentCurriculumStructure()
        ]);
        
        // Group courses by type
        const grouped = coursesData.reduce((acc, course) => {
          // Track special course pairs for later processing
          // HK 12/13 pairs
          if (course.course_code === "HK 12" || course.course_code === "HK 13") {
            if (!acc.hk_courses) {
              acc.hk_courses = [];
            }
            acc.hk_courses.push(course);
            return acc;
          }
          
          // HIST 1 and KAS 1 pairs
          if (course.course_code === "HIST 1" || course.course_code === "KAS 1") {
            if (!acc.histkas_courses) {
              acc.histkas_courses = [];
            }
            acc.histkas_courses.push(course);
            return acc;
          }

          const type = course.course_type?.toLowerCase() || 'unknown';
          
          // Handle special cases
          if (type === 'required') {
            const targetType = course.is_academic ? 'required_academic' : 'required_non_academic';
            if (!acc[targetType]) acc[targetType] = [];
            acc[targetType].push(course);
          } else if (type === 'ge' || type === 'ge elective' || type === 'ge_elective') {
            if (!acc['ge_elective']) acc['ge_elective'] = [];
            acc['ge_elective'].push(course);
          } else {
            if (!acc[type]) acc[type] = [];
            acc[type].push(course);
          }
          
          return acc;
        }, {});

        // Process HK 12 and HK 13 courses if they exist
        if (grouped.hk_courses && grouped.hk_courses.length > 0) {
          // Group HK courses by course_type and year/semester
          const groupedHKCourses = {};
          
          grouped.hk_courses.forEach(course => {
            const courseType = course.course_type?.toLowerCase() || 'unknown';
            const yearSem = `${course.year || 0}-${course.sem || 0}`;
            
            if (!groupedHKCourses[courseType]) {
              groupedHKCourses[courseType] = {};
            }
            
            if (!groupedHKCourses[courseType][yearSem]) {
              groupedHKCourses[courseType][yearSem] = {
                hk12: null,
                hk13: null,
                year: course.year,
                sem: course.sem
              };
            }
            
            if (course.course_code === "HK 12") {
              groupedHKCourses[courseType][yearSem].hk12 = course;
            } else if (course.course_code === "HK 13") {
              groupedHKCourses[courseType][yearSem].hk13 = course;
            }
          });
          
          // For each course type, create combined courses
          Object.entries(groupedHKCourses).forEach(([courseType, yearSemGroups]) => {
            Object.values(yearSemGroups).forEach(group => {
              if (group.hk12 && group.hk13) {
                const combinedHKCourse = {
                  course_id: `hk_combined_${group.hk12.course_id}_${group.hk13.course_id}`,
                  course_code: "HK 12/13",
                  title: "Physical Education & Health",
                  course_type: courseType,
                  is_academic: false,
                  units: group.hk12.units || 3,
                  prescribed_year: group.year || 1,
                  prescribed_semester: group.sem || 1,
                  description: "Physical Education & Health (HK 12 or HK 13)",
                  combined_courses: [group.hk12, group.hk13]
                };
                
                console.log('Created HK 12/13 combined course:', {
                  course: combinedHKCourse,
                  year: group.year,
                  sem: group.sem
                });
                
                const targetType = courseType === 'required' ? "required_non_academic" : courseType;
                if (!grouped[targetType]) {
                  grouped[targetType] = [];
                }
                grouped[targetType].push(combinedHKCourse);
              }
            });
          });
          
          delete grouped.hk_courses;
        }

        // Process HIST 1 and KAS 1 courses if they exist
        if (grouped.histkas_courses && grouped.histkas_courses.length > 0) {
          // Group HIST/KAS courses by course_type and year/semester
          const groupedHISTKASCourses = {};
          
          grouped.histkas_courses.forEach(course => {
            const courseType = course.course_type?.toLowerCase() || 'unknown';
            const yearSem = `${course.year || 0}-${course.sem || 0}`;
            
            if (!groupedHISTKASCourses[courseType]) {
              groupedHISTKASCourses[courseType] = {};
            }
            
            if (!groupedHISTKASCourses[courseType][yearSem]) {
              groupedHISTKASCourses[courseType][yearSem] = {
                hist1: null,
                kas1: null,
                year: course.year,
                sem: course.sem
              };
            }
            
            if (course.course_code === "HIST 1") {
              groupedHISTKASCourses[courseType][yearSem].hist1 = course;
            } else if (course.course_code === "KAS 1") {
              groupedHISTKASCourses[courseType][yearSem].kas1 = course;
            }
          });
          
          // For each course type, create combined courses
          Object.entries(groupedHISTKASCourses).forEach(([courseType, yearSemGroups]) => {
            Object.values(yearSemGroups).forEach(group => {
              if (group.hist1 && group.kas1) {
                const combinedHISTKASCourse = {
                  course_id: `histkas_combined_${group.hist1.course_id}_${group.kas1.course_id}`,
                  course_code: "HIST 1/KAS 1",
                  title: "Philippine History/Kasaysayan ng Pilipinas",
                  course_type: courseType,
                  is_academic: true,
                  units: group.hist1.units || 3,
                  prescribed_year: group.year || 1,
                  prescribed_semester: group.sem || 1,
                  description: "Philippine History (HIST 1) or Kasaysayan ng Pilipinas (KAS 1)",
                  combined_courses: [group.hist1, group.kas1]
                };
                
                const targetType = courseType === 'required' ? 
                  (combinedHISTKASCourse.is_academic ? "required_academic" : "required_non_academic") : 
                  courseType;
                
                if (!grouped[targetType]) {
                  grouped[targetType] = [];
                }
                grouped[targetType].push(combinedHISTKASCourse);
              }
            });
          });
          
          delete grouped.histkas_courses;
        }
        
        setCoursesByType(grouped);
        setCurriculumStructure(structureData);
        } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load curriculum data");
        } finally {
          setLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);
  
  // Calculate stats for each course type
  const getStatsForType = (type) => {
    if (!curriculumStructure || !curriculumStructure.totals) {
      return { 
        total: (coursesByType[type] || []).length,
        completed: 0,
        percentage: 0,
        available: (coursesByType[type] || []).length
      };
    }
    
    const courses = coursesByType[type] || [];
    
    // Handle special cases for required academic and non-academic
    if (type === "required_academic" || type === "required_non_academic") {
      const total = courses.length;
      return {
        total,
        completed: 0,
        percentage: 0,
        available: total
      };
    }
    
    // Convert type to the corresponding field names in the totals object
    const countField = `${type}_count`;
    const total = curriculumStructure.totals[countField] || courses.length;
    
    // Get prescribed semesters from curriculum structure
    const prescribedSemesters = getPrescribedSemestersForType(type);
    
    return {
      total,
      completed: 0,
      percentage: 0,
      available: courses.length,
      prescribedSemesters
    };
  };

  // Function to get prescribed semesters for each course type from curriculum structure
  const getPrescribedSemestersForType = useCallback((type) => {
    if (!curriculumStructure || !curriculumStructure.structures || curriculumStructure.structures.length === 0) {
      console.log(`No curriculum structures found for type: ${type}`);
      return [];
    }
    
    // Get relevant field from structure based on course type
    const typeCountField = `${type}_count`;
    
    try {
      // Filter structures where this type has courses (count > 0)
      const relevantStructures = curriculumStructure.structures.filter(structure => {
        // Convert to string then parse as int to handle various data types
        const countStr = String(structure[typeCountField] || '0');
        const count = parseInt(countStr, 10);
        return count > 0;
      });
      
      if (relevantStructures.length === 0) {
        return [];
      }
      
      // Map to year/semester format objects
      return relevantStructures.map(structure => ({
        year: structure.year,
        sem: structure.sem,
        count: parseInt(String(structure[typeCountField] || '0'), 10)
      }));
    } catch (error) {
      console.error(`Error processing structure data for ${type}:`, error);
      return [];
    }
  }, [curriculumStructure]); // Only depend on curriculumStructure

  // After fetching data, update courses with prescribed semester information 
  useEffect(() => {
    if (!coursesByType || !curriculumStructure?.structures) return;
    
    // Update each course type with prescribed semester information
    Object.keys(coursesByType).forEach(type => {
      // For GE electives and electives, get the prescribed semesters from curriculum structure
      if (type === 'ge_elective' || type === 'elective' || type === 'major') {
        // Get semester information from the curriculum structure
        const semestersInfo = getPrescribedSemestersForType(type);
        
        if (semestersInfo.length > 0) {
          // Format semester information for display
          const formattedSemesters = semestersInfo.map(sem => {
            const year = sem.year === "1" ? "1st Year" : 
                        sem.year === "2" ? "2nd Year" : 
                        sem.year === "3" ? "3rd Year" : 
                        `${sem.year}th Year`;
            
            const semester = sem.sem === "1" ? "1st Sem" : 
                            sem.sem === "2" ? "2nd Sem" : 
                            sem.sem === "3" || sem.sem === "M" ? "Mid Year" : 
                            `Semester ${sem.sem}`;
            
            return `${year} ${semester}`;
          });
          
          // Update each course's prescribed year and semester
          coursesByType[type].forEach((course, index) => {
            // Assign courses to semesters in a round-robin fashion
            const semesterInfo = semestersInfo[index % semestersInfo.length];
            course.prescribed_year = semesterInfo.year;
            course.prescribed_semester = semesterInfo.sem;
            course.prescribed_note = formattedSemesters;
          });
        }
      }
    });
  }, [coursesByType, curriculumStructure, getPrescribedSemestersForType]);

  const steps = [
    { title: "GE Electives", component: GEElectivesStep, type: "ge_elective" },
    { title: "Electives", component: ElectivesStep, type: "elective" },
    { title: "Majors", component: MajorsStep, type: "major" },
    { title: "Required Academic", component: RequiredAcademicStep, type: "required_academic" },
    { title: "Required Non-Academic", component: RequiredNonAcademicStep, type: "required_non_academic" },
    { title: "Review", component: SummaryStep }
  ];
  
  // Filter out steps with no courses, except for the summary step
  const availableSteps = steps.filter(step => {
    if (!step.type) return true; // Always include summary step
    const courses = coursesByType[step.type] || [];
    return courses.length > 0;
  });

  // Update currentStep if it's out of bounds after filtering
  useEffect(() => {
    if (currentStep >= availableSteps.length) {
      setCurrentStep(Math.max(0, availableSteps.length - 1));
    }
  }, [availableSteps.length, currentStep]);

  const CurrentStepComponent = availableSteps[currentStep]?.component;
  const currentStepType = availableSteps[currentStep]?.type;
  const currentStepCourses = coursesByType[currentStepType] || [];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCreatePlan = async () => {
    console.log('Starting plan creation process...');
    console.log('Current plan data:', planData);

    try {
      // Get the current plan first
      console.log('Fetching current plan...');
      const currentPlan = await plansAPI.getCurrentPlan();
      if (!currentPlan) {
        console.error('Failed to get current plan');
        throw new Error('Failed to get current plan');
      }
      console.log('Retrieved current plan:', currentPlan);

      // Add each course to the plan
      for (const [year, semesters] of Object.entries(planData)) {
        console.log(`Processing Year ${year}...`);
        
        for (const [semester, courses] of Object.entries(semesters)) {
          console.log(`Processing ${semester} of Year ${year}...`);
          
          for (const course of courses) {
            // Convert semester name to number
            const semNum = semester === "1st Sem" ? 1 : 
                          semester === "2nd Sem" ? 2 : 
                          semester === "Mid Year" ? 3 : 1;
            
            console.log('Adding course:', {
              course_code: course.course_code,
              course_id: course.course_id,
              year: parseInt(year),
              semester: semNum,
              type: course.course_type,
              isHKCourse: course.course_code === "HK 12/13",
              selectedComponentId: course._selectedComponentId
            });
            
            try {
              // For HK 12/13 courses, use the selected component's curriculum_course_id
              if (course.course_code === "HK 12/13") {
                const courseId = course._selectedComponentId;
                if (courseId) {
                  console.log('Adding HK component with ID:', courseId);
                  await plansAPI.addCourseToPlan(
                    currentPlan.id,
                    courseId,
                    parseInt(year),
                    semNum,
                    'planned'
                  );
                  console.log('Successfully added HK component');
                }
              } else {
                // For regular courses
                console.log('Adding regular course with ID:', course.course_id);
                await plansAPI.addCourseToPlan(
                  currentPlan.id,
                  course.course_id,
                  parseInt(year),
                  semNum,
                  'planned'
                );
                console.log('Successfully added regular course');
              }
            } catch (error) {
              // If the course already exists, that's fine - continue with the next one
              if (error.message.includes('already exists')) {
                console.log('Course already exists in plan, continuing...');
                continue;
              }
              console.error('Error adding course:', error);
              throw error; // Re-throw other errors
            }
          }
        }
      }

      console.log('Plan creation completed successfully');
      
      // Close the modal and refresh the plan display
      onOpenChange(false);
      if (typeof onPlanCreated === 'function') {
        console.log('Calling onPlanCreated callback...');
        onPlanCreated(currentPlan);
      }
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCourseSelect = (course) => {
    // Check if this is a combined course
    if (course?.combined_courses?.length > 0) {
      // For HK 12/13 courses, we need to check if this specific instance is already in the plan
      if (course.course_code === "HK 12/13") {
        const key = `${course.course_id}-${course.prescribed_year}-${course.prescribed_semester}`;
        const courseIds = courseIdsInPlan();
        if (courseIds.hk1213Courses.has(key)) {
          return; // Don't show the dialog if this instance is already in the plan
        }
      }
      setCombinedCourseOptions({
        course,
        options: course.combined_courses
      });
      setShowCombinedCourseDialog(true);
      return;
    }
    
    // Normal course selection behavior
    setSelectedCourse(course);
  };

  const handleCombinedCourseSelect = (selectedOption) => {
    console.log('Selected HK Component:', {
      selectedOption,
      linkedToCombinedCourse: combinedCourseOptions?.course ? {
        course_id: combinedCourseOptions.course.course_id,
        prescribed_year: combinedCourseOptions.course.prescribed_year,
        prescribed_semester: combinedCourseOptions.course.prescribed_semester
      } : null
    });

    // Create a new course object based on the selected option
    const selectedCourse = {
      ...combinedCourseOptions.course,
      course_id: selectedOption.curriculum_course_id,
      original_course_id: selectedOption.course_id,
      course_code: selectedOption.course_code,
      title: selectedOption.title,
      units: selectedOption.units,
      description: selectedOption.description,
      prescribed_year: combinedCourseOptions.course.prescribed_year,
      prescribed_semester: combinedCourseOptions.course.prescribed_semester,
      combined_courses: combinedCourseOptions.course.combined_courses,
      _isCombinedComponent: true,
      _selectedComponentId: selectedOption.curriculum_course_id
    };
    
    setSelectedCourse(selectedCourse);
    setShowCombinedCourseDialog(false);
};

  const handleSemesterClick = (year, semester) => {
    if (!selectedCourse) return;
    
    // Update plan data
    setPlanData(prev => {
      const newPlan = { ...prev };
      if (!newPlan[year]) newPlan[year] = {};
      if (!newPlan[year][semester]) newPlan[year][semester] = [];
      
      // Check if course is already in the semester
      const courseExists = newPlan[year][semester].some(course => {
        if (course.course_code === "HK 12/13") {
          const exists = course._selectedComponentId === selectedCourse._selectedComponentId;
          return exists;
        }
        return course.course_id === selectedCourse.course_id;
      });
      
      if (!courseExists) {
        const courseToAdd = {
          ...selectedCourse,
          course_type: currentStepType,
          prescribed_year: selectedCourse.prescribed_year,
          prescribed_semester: selectedCourse.prescribed_semester,
          _selectedComponentId: selectedCourse._selectedComponentId
        };

        // If adding HIST 1 or KAS 1, remove HIST 1/KAS 1 curriculum course from all semesters
        if (courseToAdd.course_code === "HIST 1" || courseToAdd.course_code === "KAS 1") {
          // Search through all years and semesters
          Object.keys(newPlan).forEach(planYear => {
            Object.keys(newPlan[planYear]).forEach(planSem => {
              // Filter out HIST 1/KAS 1 curriculum courses
              newPlan[planYear][planSem] = newPlan[planYear][planSem].filter(course => 
                !(course._isCurriculumCourse && course.course_code === "HIST 1/KAS 1")
              );
            });
          });
        }

        if (courseToAdd.course_code === "HK 12" || courseToAdd.course_code === "HK 13") {
          console.log('Adding HK Component to Plan:', {
            course_code: courseToAdd.course_code,
            curriculum_course_id: courseToAdd.course_id,
            _selectedComponentId: courseToAdd._selectedComponentId,
            year,
            semester,
            prescribed_year: courseToAdd.prescribed_year,
            prescribed_semester: courseToAdd.prescribed_semester,
            linkedToCombinedCourse: selectedCourse.combined_courses ? {
              course_id: selectedCourse.course_id,
              prescribed_year: selectedCourse.prescribed_year,
              prescribed_semester: selectedCourse.prescribed_semester
            } : 'Not linked to combined course'
          });
        }
        
        newPlan[year][semester] = [...newPlan[year][semester], courseToAdd];
        
        newPlan[year][semester].sort((a, b) => {
          if (a.course_type === 'required_non_academic' && b.course_type !== 'required_non_academic') return 1;
          if (a.course_type !== 'required_non_academic' && b.course_type === 'required_non_academic') return -1;
          return 0;
        });
      }
      
      return newPlan;
    });
    
    // Clear selected course
    setSelectedCourse(null);
    setCombinedCourseOptions(null);  // Clear combined course options

    // Process next pending HK course after a short delay
    setTimeout(() => {
      setPendingHKCourses(prev => {
        // Get the current course from the pending list
        const currentCourse = prev[0];
        if (!currentCourse) return prev; // No more courses to process
        
        // Remove the current course and get remaining courses
        const remaining = prev.slice(1);
        
        // If there are more courses, select the next one
        if (remaining.length > 0) {
          const nextCourse = remaining[0];
          handleCourseSelect(nextCourse);
        }
        
        return remaining;
      });
    }, 100);
};

  const handleRemoveCourse = (year, semester, courseIndex, targetCourse) => {
    // When in curriculum view, we need the actual course object that was passed from the PlanOverview
    setPlanData(prev => {
      const newPlan = { ...prev };
      if (newPlan[year]?.[semester]) {
        if (targetCourse?._isCurriculumCourse) return prev;
        
        if (targetCourse) {
          // Find the course by ID instead of index
          const actualIndex = newPlan[year][semester].findIndex(
            course => course.course_id === targetCourse.course_id
          );
          
          if (actualIndex !== -1) {
            newPlan[year][semester] = newPlan[year][semester].filter((_, idx) => idx !== actualIndex);
          }
        } else {
          // Fall back to original behavior if no target course is provided
          newPlan[year][semester] = newPlan[year][semester].filter((_, idx) => idx !== courseIndex);
        }
        
        // Clean up empty arrays
        if (newPlan[year][semester].length === 0) {
          delete newPlan[year][semester];
          if (Object.keys(newPlan[year]).length === 0) {
            delete newPlan[year];
          }
        }
      }
      return newPlan;
    });
  };

  const handleClear = () => {
    setPlanData({});
    setSelectedCourse(null);
  };

  const canProceedToNextStep = () => {
    // For the summary step, always allow proceeding
    if (!currentStepType) return true;
    
    // For other steps, check if we've met the requirements
    const selectedCount = Object.values(planData)
      .flatMap(yearData => Object.values(yearData))
      .flatMap(semData => semData)
      .filter(c => {
        if (currentStepType === 'required_academic') {
          return c.course_type === 'required_academic' || (c.course_type === 'required' && c.is_academic);
        } else if (currentStepType === 'required_non_academic') {
          return c.course_type === 'required_non_academic' || (c.course_type === 'required' && !c.is_academic);
        } else if (currentStepType === 'ge_elective') {
          return c.course_type === 'ge_elective' || c.course_type === 'ge' || c.course_type === 'ge elective';
        } else {
          return c.course_type === currentStepType;
        }
      })
      .length;
    
    const stats = getStatsForType(currentStepType);
    
    // Make the next button enabled when max number of courses are selected
    return selectedCount >= stats.total;
  };

  // Add search filter function
  const filterCourses = (courses) => {
    if (!searchQuery) return courses;
    const query = searchQuery.toLowerCase();
    return courses.filter(course => 
      course.course_code.toLowerCase().includes(query) || 
      course.title.toLowerCase().includes(query)
    );
  };

  const courseIdsInPlan = () => {
    const ids = new Set();
    const hk1213Courses = new Set();
    
    Object.values(planData).forEach(yearData => {
      Object.values(yearData).forEach(semData => {
        semData.forEach(course => {
          if (course.course_code === "HK 12" || course.course_code === "HK 13") {
            // For HK courses, use the curriculum_course_id
            ids.add(course.curriculum_course_id || course.course_id);
          } else {
            // For regular courses
            ids.add(course.course_id);
            // For combined courses (non-HK), also add their individual course IDs
            if (course.combined_courses) {
              course.combined_courses.forEach(c => ids.add(c.curriculum_course_id || c.course_id));
            }
          }
        });
      });
    });
    
    return {
      has: (course_id) => ids.has(course_id),
      hk1213Courses
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[95vh]">
        <DialogHeader>
          <DialogTitle>Create Your Plan of Coursework</DialogTitle>
          <DialogDescription>
            Select and organize your courses to create your academic plan.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-blue-500"></div>
            <p className="text-gray-500 text-sm">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {/* Combined Course Selection Dialog */}
            {showCombinedCourseDialog && combinedCourseOptions && (
              <Dialog open={showCombinedCourseDialog} onOpenChange={setShowCombinedCourseDialog}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Select Course Option</DialogTitle>
                    <DialogDescription>
                      Choose which course you want to add to your plan.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {combinedCourseOptions.options.map((option) => (
                      <button
                        key={option.course_id}
                        onClick={() => handleCombinedCourseSelect(option)}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{option.course_code}</p>
                          <p className="text-sm text-gray-500">{option.title}</p>
                        </div>
                        <div className="text-sm text-gray-500">{option.units} units</div>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <div className="flex gap-6 h-[calc(100%-4rem)] overflow-hidden items-start">
              {/* Left side - Overview */}
              <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
                <ScrollArea className="h-full w-full">
                  <div className="pr-4">
                    {selectedCourse && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex-shrink-0">
                        <div className="flex items-center">
                          <Check className="w-4 h-4 text-blue-500 mr-1.5" />
                          <p className="text-xs text-blue-700 font-medium">Selected Course:</p>
                        </div>
                        <p className="text-sm text-blue-600 font-medium ml-6">{selectedCourse.course_code}</p>
                        <div className="mt-2 pt-2 border-t border-blue-200 flex items-start">
                          <Info className="w-3.5 h-3.5 text-blue-500 mr-1.5 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-600">Your curriculum designates the highlighted semesters, but you can assign this course to any semester.</p>
                        </div>
                      </div>
                    )}

                    {/* Show completion message when a step has all required courses added */}
                    {currentStepType && canProceedToNextStep() && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100 flex-shrink-0">
                        <div className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-1.5" />
                          <p className="text-xs text-green-600">
                            You've added all required {currentStepType === 'ge_elective' ? 'GE Electives' : 
                                                     currentStepType === 'elective' ? 'Electives' : 
                                                     currentStepType === 'major' ? 'Major courses' : 
                                                     currentStepType === 'required_academic' ? 'Academic courses' : 
                                                     'Non-Academic courses'}. You can proceed to the next step or modify your selections.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <PlanOverview 
                      selectedCourse={selectedCourse}
                      onSemesterClick={handleSemesterClick}
                      planData={planData}
                      onRemoveCourse={handleRemoveCourse}
                      onClear={handleClear}
                      coursesByType={coursesByType}
                      getPrescribedSemestersForType={getPrescribedSemestersForType}
                      isReviewStep={availableSteps[currentStep]?.title === "Review"}
                    />
                  </div>
                </ScrollArea>
              </div>
              
              {/* Right side - Course Selection Steps */}
              <div className="w-[500px] flex flex-col h-full overflow-hidden">
                {/* Progress indicator */}
                <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                  {availableSteps.map((step, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                          ${index === currentStep ? 'bg-blue-500 text-white' : 
                            index < currentStep ? 'bg-blue-100 text-blue-500' : 
                            'bg-gray-100 text-gray-500'}`}
                      >
                        {index + 1}
                      </div>
                      {index < availableSteps.length - 1 && (
                        <div className={`w-10 h-0.5 mx-1
                          ${index < currentStep ? 'bg-blue-500' : 'bg-gray-200'}`} 
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Search bar */}
                {currentStepType && (
                  <div className="mb-4 flex-shrink-0">
                    <Input
                      type="text"
                      placeholder="Search by course code or title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Step content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  {CurrentStepComponent ? (
                    <ScrollArea className="h-full">
                      <div className="pr-4">
                        {(() => {
                          // Get the course IDs in plan once for this render
                          const courseIds = courseIdsInPlan();
                          
                          return currentStepType ? (
                            <CurrentStepComponent 
                              courses={filterCourses(currentStepCourses)}
                              onCourseSelect={handleCourseSelect}
                              selectedCourse={selectedCourse}
                              planData={planData}
                              stats={getStatsForType(currentStepType)}
                              courseIdsInPlan={courseIds}
                              onSemesterClick={handleSemesterClick}
                              setPlanData={setPlanData}
                              setPendingHKCourses={setPendingHKCourses}
                            />
                          ) : (
                            <SummaryStep planData={planData} />
                          );
                        })()}
                      </div>
                    </ScrollArea>
                  ) : null}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  
                  <Button
                    onClick={currentStep === availableSteps.length - 1 ? handleCreatePlan : handleNext}
                    className={currentStep === availableSteps.length - 1 ? 
                      "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                  >
                    {currentStep === availableSteps.length - 1 ? (
                      <>
                        <FileCheck className="w-4 h-4 mr-2" /> 
                        Create Plan
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Update the course items to show placement info
const CourseItemWithPlacement = ({ course, type, planData }) => {
  // Find where this course is placed in the plan
  let placement = null;
  
  Object.entries(planData).forEach(([year, yearData]) => {
    Object.entries(yearData).forEach(([sem, courses]) => {
      courses.forEach(c => {
        if (course.course_code === "HK 12/13") {
          // For HK 12/13 courses, check if any of its components are in the plan using curriculum_course_id
          const courseComponents = course.combined_courses || [];
          const isComponentInPlan = courseComponents.some(component => {
            // Check if this component's curriculum_course_id matches any course in the plan
            return c.curriculum_course_id === component.curriculum_course_id ||
                   c._selectedComponentId === component.curriculum_course_id;
          });
          if (isComponentInPlan) {
            placement = { year, sem };
          }
        } else if (course.combined_courses) {
          // For other combined courses
          const isComponentInPlan = course.combined_courses.some(component => 
            c.curriculum_course_id === component.curriculum_course_id
          );
          if (isComponentInPlan) {
            placement = { year, sem };
          }
        } else {
          // For regular courses
          if (c.curriculum_course_id === course.curriculum_course_id || 
              c.course_id === course.course_id) {
            placement = { year, sem };
          }
        }
      });
    });
  });

  const getYearText = (year) => {
    switch (year) {
      case "1": return "1st Year";
      case "2": return "2nd Year";
      case "3": return "3rd Year";
      case "4": return "4th Year";
      default: return `${year}th Year`;
    }
  };

  return (
    <div className="relative">
      <CourseItem course={course} type={type} />
      {placement && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
          {getYearText(placement.year)} {placement.sem}
        </div>
      )}
    </div>
  );
};

export default PlanCreationModal; 