import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CourseItem from "@/components/CourseItem";
import { useState } from "react";
import { List } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCourseTypeColor, getCourseTypeName } from "@/lib/utils";

const CourseTypeCard = ({ type, courses, stats }) => {
  const [open, setOpen] = useState(false);
  
  // Ensure courses is an array
  const courseList = Array.isArray(courses) ? courses : [];
  
  // Check if this is an elective course type
  const standardType = type.toLowerCase();
  const isElectiveType = standardType === 'elective' || 
                        standardType === 'ge_elective' || 
                        standardType === 'ge elective' || 
                        standardType === 'geelective' ||
                        standardType === 'major';
  
  // Determine whether to show the "Show more" button (for many courses)
  const shouldShowViewAll = courseList.length > 5;
  
  // Limit the display to the first 5 courses
  const displayedCourses = courseList.slice(0, 5);
    
  // Placeholder values for progress (to be implemented with real data later)
  const placeholderProgress = {
    completed: 0,
    percentage: 0
  };
  
  // Create a description based on the course type
  const getCardDescription = () => {
    // If there are no courses for this type in the courseList, check if we still need to take some
    if (courseList.length === 0) {
      // If stats exists and has a total > 0, we need to take courses of this type
      if (stats && stats.total > 0) {
        return `Need to take ${stats.total} courses`;
      }
      return `No ${getCourseTypeName(type).toLowerCase()} in your curriculum`;
    }
    
    // For elective types and majors, show how many to choose from
    if (isElectiveType && stats.available > stats.total) {
      return `Choose ${stats.total} from ${stats.available} available courses`;
    }
    
    // For all courses including required courses, use the actual count
    return `${courseList.length} courses required`;
  };

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-2 h-6 rounded mr-2 ${getCourseTypeColor(type)}`}></div>
            <CardTitle className="text-lg">{getCourseTypeName(type)}</CardTitle>
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded-md text-sm font-medium">
              {placeholderProgress.completed}/{standardType === 'required' ? courseList.length : stats.total}
            </div>
          </div>
          <div className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
            {placeholderProgress.percentage}%
          </div>
        </div>
        <CardDescription>{getCardDescription()}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between">
        {courseList.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {stats && stats.total > 0 
              ? `You need to take ${stats.total} ${getCourseTypeName(type).toLowerCase()} according to your curriculum.`
              : "No courses are assigned to this category in your curriculum."}
          </p>
        ) : (
          <>
            {/* Progress bar (placeholder) */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Completion</span>
                <span className="text-sm text-gray-500">Progress tracking coming soon</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full ${getCourseTypeColor(type)}`} 
                  style={{ 
                    width: `${placeholderProgress.percentage}%`,
                    transition: 'width 1s ease-in-out'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex-1">
              {/* Course list (showing only 5) */}
              <div className="space-y-2">
                {displayedCourses.map((course, index) => (
                  <CourseItem 
                    key={`${course.course_id}-${index}`}
                    course={{
                      ...course,
                      // Ensure the course_type is set if it isn't already
                      course_type: course.course_type || type
                    }}
                    type={type} 
                  />
                ))}
              </div>
              
              {/* View all courses button */}
              {shouldShowViewAll && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button 
                      className="text-sm text-blue-600 border border-blue-600 hover:bg-blue-50 mt-4 flex items-center w-full justify-center py-2 rounded-md transition-colors"
                    >
                      <List className="h-4 w-4 mr-1.5" />
                      View all {courseList.length} courses
                    </button>
                  </DialogTrigger>
                  <DialogContent 
                    className="sm:max-w-2xl"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <DialogHeader>
                      <DialogTitle className="flex items-center">
                        <div className={`w-3 h-6 rounded mr-2 ${getCourseTypeColor(type)}`}></div>
                        {getCourseTypeName(type)}
                      </DialogTitle>
                      <DialogDescription>
                        {isElectiveType && stats.available > stats.total
                          ? `Choose ${stats.total} from ${stats.available} available courses based on your interests.`
                          : `These are the ${getCourseTypeName(type).toLowerCase()} you need to complete.`}
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh] mt-2">
                      <div className="space-y-2 px-1">
                        {courseList.map((course, index) => (
                          <CourseItem 
                            key={`${course.course_id}-${index}`}
                            course={{
                              ...course,
                              course_type: course.course_type || type
                            }}
                            type={type} 
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseTypeCard; 