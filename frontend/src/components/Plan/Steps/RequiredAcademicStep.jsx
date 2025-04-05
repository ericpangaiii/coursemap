import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchX, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseItemWithPlacement from "../CourseItemWithPlacement";

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

export default RequiredAcademicStep; 