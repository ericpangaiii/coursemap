import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CourseItem from "@/components/CourseItem";

const SelectElectives = ({ onSelectionChange }) => {
  // Mock array of elective courses with details
  const electiveCourses = [
    {
      id: 1,
      course_code: "CS 198",
      title: "Special Topics in Computer Science",
      units: 3,
      sem_offered: "Both",
      description: "Advanced topics in computer science, varying by semester."
    },
    {
      id: 2,
      course_code: "CS 199",
      title: "Computer Science Seminar",
      units: 1,
      sem_offered: "Both",
      description: "Seminar series on current topics in computer science."
    },
    {
      id: 3,
      course_code: "CS 197",
      title: "Computer Science Research Methods",
      units: 3,
      sem_offered: "Both",
      description: "Introduction to research methods in computer science."
    }
  ];

  // State to track selected courses
  const [selectedCourses, setSelectedCourses] = useState({});
  const requiredCourses = 3;

  // Helper function to count completed selections
  const countCompletedSelections = (courses) => {
    return Object.values(courses).filter(
      course => course?.selected && course?.year && course?.semester
    ).length;
  };

  // Handle checkbox change
  const handleSelectCourse = (courseId) => {
    setSelectedCourses(prev => {
      const newState = {
        ...prev,
        [courseId]: {
          ...prev[courseId],
          selected: !prev[courseId]?.selected
        }
      };
      
      // Notify parent of selection count
      onSelectionChange?.(countCompletedSelections(newState));
      
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
      
      // Notify parent of selection count
      onSelectionChange?.(countCompletedSelections(newState));
      
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
      
      // Notify parent of selection count
      onSelectionChange?.(countCompletedSelections(newState));
      
      return newState;
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 rounded bg-purple-500"></div>
          <div className="text-sm font-medium">
            Selected: {countCompletedSelections(selectedCourses)}/{requiredCourses}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {electiveCourses.map((course) => (
          <Card 
            key={course.id} 
            className={`overflow-hidden cursor-pointer ${selectedCourses[course.id]?.selected ? 'border-blue-500' : ''}`}
            onClick={() => handleSelectCourse(course.id)}
          >
            <CardContent className="p-0">
              <div className="flex items-start">
                <div className="w-2 h-full bg-purple-500 flex-shrink-0"></div>
                <div className="flex items-start p-3 flex-grow">
                  <div className="flex-shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      id={`course-${course.id}`}
                      checked={selectedCourses[course.id]?.selected || false}
                      onCheckedChange={() => handleSelectCourse(course.id)}
                    />
                  </div>
                  <div className="ml-3 flex-grow">
                    <CourseItem course={course} type="elective" />
                  </div>
                  <div 
                    className="flex-shrink-0 flex items-center space-x-2 ml-2 pl-3 border-l" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Select
                      value={selectedCourses[course.id]?.year || ""}
                      onValueChange={(value) => handleYearChange(course.id, value)}
                      disabled={!selectedCourses[course.id]?.selected}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Year 1</SelectItem>
                        <SelectItem value="2">Year 2</SelectItem>
                        <SelectItem value="3">Year 3</SelectItem>
                        <SelectItem value="4">Year 4</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={selectedCourses[course.id]?.semester || ""}
                      onValueChange={(value) => handleSemesterChange(course.id, value)}
                      disabled={!selectedCourses[course.id]?.selected}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">First Sem</SelectItem>
                        <SelectItem value="2">Second Sem</SelectItem>
                        <SelectItem value="M">Midyear</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SelectElectives; 