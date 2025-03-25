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

const CourseTypeCard = ({ type, courses, stats }) => {
  const [open, setOpen] = useState(false);
  
  // Get a readable name for the course type
  const getTypeName = (type) => {
    // Standardize type name
    let standardType = type.toLowerCase();
    
    // Special handling for GE Electives
    if (standardType === "ge elective" || standardType === "geelective") {
      standardType = "ge_elective";
    }
    
    const names = {
      'major': 'Major Courses',
      'required': 'Required Courses',
      'ge_elective': 'GE Electives',
      'elective': 'Elective Courses',
      'cognate': 'Cognate Courses',
      'specialized': 'Specialized Courses',
      'track': 'Track Courses'
    };
    return names[standardType] || type;
  };

  // Format course type for color
  const getTypeColor = (type) => {
    // Standardize type name
    let standardType = type.toLowerCase();
    
    // Special handling for GE Electives
    if (standardType === "ge elective" || standardType === "geelective") {
      standardType = "ge_elective";
    }
    
    const colors = {
      'major': 'bg-red-500',
      'required': 'bg-green-500',
      'ge_elective': 'bg-yellow-500',
      'elective': 'bg-purple-500',
      'cognate': 'bg-indigo-500',
      'specialized': 'bg-teal-500',
      'track': 'bg-orange-500'
    };
    return colors[standardType] || 'bg-blue-500';
  };

  // Ensure courses is an array
  const courseList = Array.isArray(courses) ? courses : [];
  
  // Check if this is an elective course type
  const standardType = type.toLowerCase();
  const isElectiveType = standardType === 'elective' || 
                        standardType === 'ge_elective' || 
                        standardType === 'ge elective' || 
                        standardType === 'geelective';
  
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
      return `No ${getTypeName(type).toLowerCase()} in your curriculum`;
    }
    
    // For elective types, show how many to choose from
    if (isElectiveType && stats.available > stats.total) {
      return `Choose ${stats.total} from ${stats.available} available courses`;
    }
    
    // If this is the required course type, use stats.total instead of courseList.length
    if (standardType === 'required' && stats && stats.total) {
      return `${stats.total} courses required`;
    }
    
    return `${courseList.length} courses required`; 
  };

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CardTitle className="text-lg">{getTypeName(type)}</CardTitle>
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded-md text-sm font-medium">
              {placeholderProgress.completed}/{stats.total || courseList.length}
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
              ? `You need to take ${stats.total} ${getTypeName(type).toLowerCase()} according to your curriculum.`
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
                  className={`h-2.5 rounded-full ${getTypeColor(type)}`} 
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
                  />
                ))}
              </div>
              
              {/* View all courses button */}
              {shouldShowViewAll && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-800 mt-4 flex items-center w-full justify-center py-2 border border-blue-100 rounded-md hover:bg-blue-50 transition-colors"
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
                      <div className="flex items-center mb-2">
                        <div className={`w-2 h-6 rounded mr-2 ${getTypeColor(type)}`}></div>
                        <DialogTitle>{getTypeName(type)}</DialogTitle>
                      </div>
                      <DialogDescription>{getCardDescription()}</DialogDescription>
                    </DialogHeader>
                    
                    {isElectiveType && (
                      <div className="mb-4 px-3 py-2 bg-blue-50 text-blue-800 rounded-md border border-blue-100 text-sm">
                        <p>You need to select {stats.total} courses from these options.</p>
                      </div>
                    )}
                    
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                      {courseList.map((course, index) => (
                        <CourseItem 
                          key={`modal-${course.course_id}-${index}`}
                          course={{
                            ...course,
                            course_type: course.course_type || type
                          }} 
                        />
                      ))}
                    </div>
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