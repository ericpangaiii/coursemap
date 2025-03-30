import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Trash2, Info, SearchX, Check } from "lucide-react";
import { curriculumsAPI } from "@/lib/api";
import CourseItem from "@/components/CourseItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCourseTypeColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Step components
const GEElectivesStep = ({ courses = [], onCourseSelect, selectedCourse, planData, stats, courseIdsInPlan }) => {
  const selectedCount = Object.values(planData)
    .flatMap(yearData => Object.values(yearData))
    .flatMap(semData => semData)
    .filter(c => c.course_type === 'ge_elective' || c.course_type === 'ge' || c.course_type === 'ge elective')
    .length;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">GE Electives</h3>
          <div className="ml-2 px-2 py-1 bg-gray-100 rounded-md text-sm font-medium">
            {selectedCount}/{stats.total}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Choose {stats.total} from {stats.available} available options
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-4 p-1">
            {courses.length > 0 ? (
              courses.map((course, index) => {
                // Check if this course is in the plan
                let isInPlan = false;
                if (course.course_code === "HK 12/13") {
                  // For HK 12/13 courses, check specific instance with year and semester
                  const key = `${course.course_id}-${course.prescribed_year}-${course.prescribed_semester}`;
                  isInPlan = courseIdsInPlan.hk1213Courses.has(key);
                } else {
                  // For regular courses
                  isInPlan = courseIdsInPlan.has(course.course_id) || 
                    (course.combined_courses && 
                     course.combined_courses.some(c => courseIdsInPlan.has(c.course_id)));
                }
                
                // Enhanced selection check for HK 12/13 courses
                const isSelected = selectedCourse && 
                  // Check exact course ID match
                  selectedCourse.course_id === course.course_id && 
                  // For HK 12/13 courses, also check prescribed year and semester
                  !(course.course_code === "HK 12/13" && 
                    (selectedCourse.prescribed_year !== course.prescribed_year || 
                     selectedCourse.prescribed_semester !== course.prescribed_semester));
                
                return (
                  <div
                    key={`${course.course_id}-${index}`}
                    className="w-[450px]"
                  >
                    <button
                      onClick={() => {
                        if (!isInPlan) {
                          if (isSelected) {
                            onCourseSelect(null);
                          } else {
                            onCourseSelect(course);
                          }
                        }
                      }}
                      className={`w-full text-left relative rounded-lg overflow-hidden
                        ${isInPlan ? 'opacity-50' : 'hover:bg-gray-50'}`}
                      disabled={isInPlan}
                    >
                      <CourseItemWithPlacement 
                        course={course}
                        type="ge_elective"
                        planData={planData}
                      />
                      {isSelected && !isInPlan && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                          <Check className="h-3 w-3" />
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

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">Electives</h3>
          <div className="ml-2 px-2 py-1 bg-gray-100 rounded-md text-sm font-medium">
            {selectedCount}/{stats.total}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Choose {stats.total} from {stats.available} available options
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-4 p-1">
            {courses.length > 0 ? (
              courses.map((course, index) => {
                // Check if this course is in the plan
                let isInPlan = false;
                if (course.course_code === "HK 12/13") {
                  // For HK 12/13 courses, check specific instance with year and semester
                  const key = `${course.course_id}-${course.prescribed_year}-${course.prescribed_semester}`;
                  isInPlan = courseIdsInPlan.hk1213Courses.has(key);
                } else {
                  // For regular courses
                  isInPlan = courseIdsInPlan.has(course.course_id) || 
                    (course.combined_courses && 
                     course.combined_courses.some(c => courseIdsInPlan.has(c.course_id)));
                }
                
                // Enhanced selection check for HK 12/13 courses
                const isSelected = selectedCourse && 
                  // Check exact course ID match
                  selectedCourse.course_id === course.course_id && 
                  // For HK 12/13 courses, also check prescribed year and semester
                  !(course.course_code === "HK 12/13" && 
                    (selectedCourse.prescribed_year !== course.prescribed_year || 
                     selectedCourse.prescribed_semester !== course.prescribed_semester));
                
                return (
                  <div
                    key={`${course.course_id}-${index}`}
                    className="w-[450px]"
                  >
                    <button
                      onClick={() => {
                        if (!isInPlan) {
                          if (isSelected) {
                            onCourseSelect(null);
                          } else {
                            onCourseSelect(course);
                          }
                        }
                      }}
                      className={`w-full text-left relative rounded-lg overflow-hidden
                        ${isInPlan ? 'opacity-50' : 'hover:bg-gray-50'}`}
                      disabled={isInPlan}
                    >
                      <CourseItemWithPlacement 
                        course={course}
                        type="elective"
                        planData={planData}
                      />
                      {isSelected && !isInPlan && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                          <Check className="h-3 w-3" />
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

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">Major Courses</h3>
          <div className="ml-2 px-2 py-1 bg-gray-100 rounded-md text-sm font-medium">
            {selectedCount}/{stats.total}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {stats.total} required major courses
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-4 p-1">
            {courses.length > 0 ? (
              courses.map((course, index) => {
                // Check if this course is in the plan
                let isInPlan = false;
                if (course.course_code === "HK 12/13") {
                  // For HK 12/13 courses, check specific instance with year and semester
                  const key = `${course.course_id}-${course.prescribed_year}-${course.prescribed_semester}`;
                  isInPlan = courseIdsInPlan.hk1213Courses.has(key);
                } else {
                  // For regular courses
                  isInPlan = courseIdsInPlan.has(course.course_id) || 
                    (course.combined_courses && 
                     course.combined_courses.some(c => courseIdsInPlan.has(c.course_id)));
                }
                
                // Enhanced selection check for HK 12/13 courses
                const isSelected = selectedCourse && 
                  // Check exact course ID match
                  selectedCourse.course_id === course.course_id && 
                  // For HK 12/13 courses, also check prescribed year and semester
                  !(course.course_code === "HK 12/13" && 
                    (selectedCourse.prescribed_year !== course.prescribed_year || 
                     selectedCourse.prescribed_semester !== course.prescribed_semester));
                
                return (
                  <div
                    key={`${course.course_id}-${index}`}
                    className="w-[450px]"
                  >
                    <button
                      onClick={() => {
                        if (!isInPlan) {
                          if (isSelected) {
                            onCourseSelect(null);
                          } else {
                            onCourseSelect(course);
                          }
                        }
                      }}
                      className={`w-full text-left relative rounded-lg overflow-hidden
                        ${isInPlan ? 'opacity-50' : 'hover:bg-gray-50'}`}
                      disabled={isInPlan}
                    >
                      <CourseItemWithPlacement 
                        course={course}
                        type="major"
                        planData={planData}
                      />
                      {isSelected && !isInPlan && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                          <Check className="h-3 w-3" />
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

const RequiredAcademicStep = ({ courses = [], onCourseSelect, selectedCourse, planData, stats, courseIdsInPlan }) => {
  const selectedCount = Object.values(planData)
    .flatMap(yearData => Object.values(yearData))
    .flatMap(semData => semData)
    .filter(c => c.course_type === 'required_academic' || 
      (c.course_type === 'required' && c.is_academic))
    .length;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">Required Academic</h3>
          <div className="ml-2 px-2 py-1 bg-gray-100 rounded-md text-sm font-medium">
            {selectedCount}/{stats.total}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {stats.total} required academic courses
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-4 p-1">
            {courses.length > 0 ? (
              courses.map((course, index) => {
                // Check if this course is in the plan
                let isInPlan = false;
                if (course.course_code === "HK 12/13") {
                  // For HK 12/13 courses, check specific instance with year and semester
                  const key = `${course.course_id}-${course.prescribed_year}-${course.prescribed_semester}`;
                  isInPlan = courseIdsInPlan.hk1213Courses.has(key);
                } else {
                  // For regular courses
                  isInPlan = courseIdsInPlan.has(course.course_id) || 
                    (course.combined_courses && 
                     course.combined_courses.some(c => courseIdsInPlan.has(c.course_id)));
                }
                
                // Enhanced selection check for HK 12/13 courses
                const isSelected = selectedCourse && 
                  // Check exact course ID match
                  selectedCourse.course_id === course.course_id && 
                  // For HK 12/13 courses, also check prescribed year and semester
                  !(course.course_code === "HK 12/13" && 
                    (selectedCourse.prescribed_year !== course.prescribed_year || 
                     selectedCourse.prescribed_semester !== course.prescribed_semester));
                
                return (
                  <div
                    key={`${course.course_id}-${index}`}
                    className="w-[450px]"
                  >
                    <button
                      onClick={() => {
                        if (!isInPlan) {
                          if (isSelected) {
                            onCourseSelect(null);
                          } else {
                            onCourseSelect(course);
                          }
                        }
                      }}
                      className={`w-full text-left relative rounded-lg overflow-hidden
                        ${isInPlan ? 'opacity-50' : 'hover:bg-gray-50'}`}
                      disabled={isInPlan}
                    >
                      <CourseItemWithPlacement 
                        course={course}
                        type="required_academic"
                        planData={planData}
                      />
                      {isSelected && !isInPlan && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                          <Check className="h-3 w-3" />
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

const RequiredNonAcademicStep = ({ courses = [], onCourseSelect, selectedCourse, planData, stats, courseIdsInPlan }) => {
  const selectedCount = Object.values(planData)
    .flatMap(yearData => Object.values(yearData))
    .flatMap(semData => semData)
    .filter(c => c.course_type === 'required_non_academic' || 
      (c.course_type === 'required' && !c.is_academic))
    .length;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">Required Non-Academic</h3>
          <div className="ml-2 px-2 py-1 bg-gray-100 rounded-md text-sm font-medium">
            {selectedCount}/{stats.total}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {stats.total} required non-academic courses
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-4 p-1">
            {courses.length > 0 ? (
              courses.map((course, index) => {
                // Check if this course is in the plan
                let isInPlan = false;
                if (course.course_code === "HK 12/13") {
                  // For HK 12/13 courses, check specific instance with year and semester
                  const key = `${course.course_id}-${course.prescribed_year}-${course.prescribed_semester}`;
                  isInPlan = courseIdsInPlan.hk1213Courses.has(key);
                } else {
                  // For regular courses
                  isInPlan = courseIdsInPlan.has(course.course_id) || 
                    (course.combined_courses && 
                     course.combined_courses.some(c => courseIdsInPlan.has(c.course_id)));
                }
                
                // Enhanced selection check for HK 12/13 courses
                const isSelected = selectedCourse && 
                  // Check exact course ID match
                  selectedCourse.course_id === course.course_id && 
                  // For HK 12/13 courses, also check prescribed year and semester
                  !(course.course_code === "HK 12/13" && 
                    (selectedCourse.prescribed_year !== course.prescribed_year || 
                     selectedCourse.prescribed_semester !== course.prescribed_semester));
                
                return (
                  <div
                    key={`${course.course_id}-${index}`}
                    className="w-[450px]"
                  >
                    <button
                      onClick={() => {
                        if (!isInPlan) {
                          if (isSelected) {
                            onCourseSelect(null);
                          } else {
                            onCourseSelect(course);
                          }
                        }
                      }}
                      className={`w-full text-left relative rounded-lg overflow-hidden
                        ${isInPlan ? 'opacity-50' : 'hover:bg-gray-50'}`}
                      disabled={isInPlan}
                    >
                      <CourseItemWithPlacement 
                        course={course}
                        type="required_non_academic"
                        planData={planData}
                      />
                      {isSelected && !isInPlan && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                          <Check className="h-3 w-3" />
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

const SummaryStep = ({ planData }) => {
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
  const totalUnits = Object.values(stats).reduce((sum, { units }) => sum + units, 0);
  const totalCourses = Object.values(stats).reduce((sum, { count }) => sum + count, 0);

  const typeLabels = {
    ge_elective: "GE Electives",
    elective: "Electives",
    major: "Major Courses",
    required_academic: "Required Academic",
    required_non_academic: "Required Non-Academic"
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Plan Summary</h3>
        <p className="text-sm text-gray-500 mt-1">
          Review your course selections before finalizing your plan.
        </p>
      </div>
      <div className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Course Type</TableHead>
              <TableHead className="text-center w-[100px]">Courses</TableHead>
              <TableHead className="text-center w-[100px]">Units</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(stats).map(([type, { count, units }]) => (
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
            <TableRow className="font-medium">
              <TableCell className="w-[300px]">Total</TableCell>
              <TableCell className="text-center w-[100px]">{totalCourses}</TableCell>
              <TableCell className="text-center w-[100px]">{totalUnits}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Overview component that shows the current plan state
const PlanOverview = ({ selectedCourse, onSemesterClick, planData, onRemoveCourse, onClear }) => {
  const years = [1, 2, 3, 4];
  const semesters = ["1st Sem", "2nd Sem", "Mid Year"];
  
  // Check if this semester matches the selected course's prescribed schedule
  const isPrescribedSchedule = (year, sem) => {
    if (!selectedCourse) return false;
    
    // Normalize semester names to match data format
    const normalizedSem = 
      sem === "1st Sem" ? "1" : 
      sem === "2nd Sem" ? "2" : 
      sem === "Mid Year" ? "3" : sem;
    
    // For courses with multiple prescribed semesters as an array (GE electives, electives, majors)
    if (selectedCourse.prescribed_note && Array.isArray(selectedCourse.prescribed_note)) {
      // Log for debugging
      if (year === 1 && sem === "1st Sem") {
        console.log("Checking prescribed semesters array for:", selectedCourse.course_code);
        console.log("Prescribed notes:", selectedCourse.prescribed_note);
      }
      
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
          const isMatch = String(prescribedYear) === String(year) && prescribedSem === normalizedSem;
          if (isMatch && year === 1 && sem === "1st Sem") {
            console.log("Found match:", prescribedSemStr, "for year:", year, "sem:", sem);
          }
          return isMatch;
        }
        
        return false;
      });
    }
    
    // For courses with multiple prescribed semesters as a string (comma-separated)
    if (selectedCourse.prescribed_note && typeof selectedCourse.prescribed_note === 'string') {
      // Log for debugging
      if (year === 1 && sem === "1st Sem") {
        console.log("Checking prescribed semesters string for:", selectedCourse.course_code);
        console.log("Prescribed notes string:", selectedCourse.prescribed_note);
      }
      
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
          const isMatch = String(prescribedYear) === String(year) && prescribedSem === normalizedSem;
          if (isMatch && year === 1 && sem === "1st Sem") {
            console.log("Found string match:", prescribedSemStr, "for year:", year, "sem:", sem);
          }
          return isMatch;
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
    
    // Log for debugging single semester case
    if (year === 1 && sem === "1st Sem") {
      console.log("Single semester check for:", selectedCourse.course_code);
      console.log("Year:", prescribedYear, "Semester:", prescribedSemester);
    }
    
    // Compare with current semester
    const isMatch = String(prescribedYear) === String(year) && String(prescribedSemester) === normalizedSem;
    if (isMatch && year === 1 && sem === "1st Sem") {
      console.log("Found match for single semester course:", selectedCourse.course_code);
    }
    return isMatch;
  };
  
  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500">Overview</h3>
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
      <div className="space-y-4">
        {years.map(year => (
          <div key={year} className="space-y-2">
            <h4 className="text-sm font-medium">{year === 1 ? "1st" : year === 2 ? "2nd" : year === 3 ? "3rd" : "4th"} Year</h4>
            <div className="grid grid-cols-3 gap-2">
              {semesters.map(sem => {
                const coursesInSem = planData[year]?.[sem] || [];
                const hasContent = coursesInSem.length > 0;
                const isPrescribed = isPrescribedSchedule(year, sem);
                
                return (
                  <button
                    key={sem}
                    onClick={() => selectedCourse && onSemesterClick(year, sem)}
                    className={`border rounded p-2 text-left transition-colors relative min-h-[4rem]
                      ${selectedCourse ? 'hover:border-blue-300 cursor-pointer' : 'cursor-default'}
                      ${hasContent && !isPrescribed ? 'bg-gray-50' : ''}
                      ${isPrescribed ? 'bg-blue-50 border-blue-300' : ''}`}
                  >
                    <p className={`text-xs font-medium ${isPrescribed ? 'text-blue-600' : 'text-gray-500'}`}>{sem}</p>
                    {hasContent ? (
                      <div className="space-y-1 mt-1">
                        {coursesInSem.map((course, idx) => (
                          <div key={idx} className="flex items-center group">
                            <div 
                              className={`w-1 h-4 rounded-full mr-1.5 ${getCourseTypeColor(course.course_type)}`}
                            />
                            <p className="text-xs text-gray-600 truncate flex-1">
                              {course.course_code}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveCourse(year, sem, idx);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded transition-opacity"
                            >
                              <X className="h-3 w-3 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-xs ${isPrescribed ? 'text-blue-400' : 'text-gray-400'}`}>Empty</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Main modal component
const PlanCreationModal = ({ open, onOpenChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coursesByType, setCoursesByType] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [planData, setPlanData] = useState({});
  const [curriculumStructure, setCurriculumStructure] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
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
  const getPrescribedSemestersForType = (type) => {
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
  };

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
  }, [coursesByType, curriculumStructure]);

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
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };
  
  const handleSemesterClick = (year, semester) => {
    if (!selectedCourse) return;
    
    // Update plan data
    setPlanData(prev => {
      const newPlan = { ...prev };
      if (!newPlan[year]) newPlan[year] = {};
      if (!newPlan[year][semester]) newPlan[year][semester] = [];
      
      // Check if course is already in the semester
      const courseExists = newPlan[year][semester].some(
        course => course.course_id === selectedCourse.course_id
      );
      
      if (!courseExists) {
        // Ensure we preserve the course_type and combined courses when adding to plan
        const courseToAdd = {
          ...selectedCourse,
          course_type: currentStepType
        };
        newPlan[year][semester] = [...newPlan[year][semester], courseToAdd];
      }
      
      return newPlan;
    });
    
    // Clear selected course
    setSelectedCourse(null);
  };

  const handleRemoveCourse = (year, semester, courseIndex) => {
    setPlanData(prev => {
      const newPlan = { ...prev };
      if (newPlan[year]?.[semester]) {
        newPlan[year][semester] = newPlan[year][semester].filter((_, idx) => idx !== courseIndex);
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
    // Temporarily disable course count requirement
    return true;
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
    const hk1213Courses = new Map(); // Map to track HK 12/13 courses by year and semester
    
    Object.values(planData).forEach(yearData => {
      Object.values(yearData).forEach(semData => {
        semData.forEach(course => {
          if (course.course_code === "HK 12/13") {
            // For HK 12/13 courses, track them with their prescribed year and semester
            const key = `${course.course_id}-${course.prescribed_year}-${course.prescribed_semester}`;
            hk1213Courses.set(key, true);
          } else {
            // For regular courses
            ids.add(course.course_id);
            // For combined courses (non-HK), also add their individual course IDs
            if (course.combined_courses) {
              course.combined_courses.forEach(c => ids.add(c.course_id));
            }
          }
        });
      });
    });
    
    return {
      has: (course_id) => {
        if (course_id.startsWith('hk_combined_')) {
          // Not just check course_id for HK 12/13, also check the specific instance
          return false; // We'll handle this in the isInPlan check
        }
        return ids.has(course_id);
      },
      hk1213Courses
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[95vh]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Create Your Plan of Coursework</DialogTitle>
            </DialogHeader>

            <div className="flex gap-6 h-[calc(100%-4rem)] overflow-hidden">
              {/* Left side - Overview */}
              <div className="flex-1 h-full flex flex-col min-w-0">
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
                          <p className="text-xs text-blue-600">Highlighted semesters are prescribed by your curriculum, but you can add this course to any semester.</p>
                        </div>
                      </div>
                    )}
                    <PlanOverview 
                      selectedCourse={selectedCourse}
                      onSemesterClick={handleSemesterClick}
                      planData={planData}
                      onRemoveCourse={handleRemoveCourse}
                      onClear={handleClear}
                    />
                  </div>
                </ScrollArea>
              </div>
              
              {/* Right side - Course Selection Steps */}
              <div className="w-[500px] flex flex-col h-full">
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
                    <div className="h-full">
                      {currentStepType ? (
                        <CurrentStepComponent 
                          courses={filterCourses(currentStepCourses)}
                          onCourseSelect={handleCourseSelect}
                          selectedCourse={selectedCourse}
                          planData={planData}
                          stats={getStatsForType(currentStepType)}
                          courseIdsInPlan={courseIdsInPlan()}
                        />
                      ) : (
                        <SummaryStep planData={planData} />
                      )}
                    </div>
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
                    onClick={handleNext}
                    disabled={currentStep === availableSteps.length - 1 || !canProceedToNextStep()}
                  >
                    {currentStep === availableSteps.length - 1 ? 'Create Plan' : 'Next'}
                    {currentStep < availableSteps.length - 1 && (
                      <ChevronRight className="w-4 h-4 ml-2" />
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
      // For regular courses, check just the course ID
      if (course.course_code !== "HK 12/13" && courses.some(c => c.course_id === course.course_id)) {
        placement = { year, sem };
      } 
      // For HK 12/13 courses, check both course ID AND prescribed year/semester
      else if (course.course_code === "HK 12/13") {
        courses.forEach(c => {
          if (c.course_id === course.course_id && 
              c.prescribed_year === course.prescribed_year && 
              c.prescribed_semester === course.prescribed_semester) {
            placement = { year, sem };
          }
        });
      }
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