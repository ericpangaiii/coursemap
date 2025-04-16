import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchX, Check } from "lucide-react";
import CourseItemWithPlacement from "../CourseItemWithPlacement";

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
          <h3 className="text-lg font-semibold">Majors</h3>
          <div className={`ml-2 px-2 py-1 ${isMaxReached ? 'bg-green-100 text-green-800' : 'bg-gray-100'} rounded-md text-sm font-medium`}>
            {selectedCount}/{stats.total}
          </div>
        </div>
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

export default MajorsStep; 