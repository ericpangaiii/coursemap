import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CourseItem from "@/components/CourseItem";

const SelectGEElectives = ({ onSelectionChange }) => {
  // Mock array of GE courses with details
  const geCourses = [
    {
      id: 1,
      course_code: "GE MATH 1",
      title: "Mathematics, Culture and Society",
      units: 3,
      sem_offered: "Both",
      description: "Appreciation of the beauty and power of mathematics and its relationship with other disciplines."
    },
    {
      id: 2,
      course_code: "GE ARTS 1",
      title: "Critical Perspectives in the Arts",
      units: 3,
      sem_offered: "Both",
      description: "Critical exploration of various art forms and their cultural contexts."
    },
    {
      id: 3,
      course_code: "GE ETHICS 1",
      title: "Ethics and Moral Reasoning in Everyday Life",
      units: 3,
      sem_offered: "Both",
      description: "Examination of ethical principles and their application to everyday situations."
    },
    {
      id: 4,
      course_code: "GE KAS 1",
      title: "Kasaysayan ng Pilipinas",
      units: 3,
      sem_offered: "Both",
      description: "Critical analysis of significant developments in Philippine history."
    },
    {
      id: 5,
      course_code: "GE COMM 10",
      title: "Critical Perspectives in Communication",
      units: 3,
      sem_offered: "Both",
      description: "Critical examination of communication processes and their social impacts."
    },
    {
      id: 6,
      course_code: "GE STS 1",
      title: "Science, Technology, and Society",
      units: 3,
      sem_offered: "Both",
      description: "Interdisciplinary examination of the social dimensions of science and technology."
    }
  ];

  // State to track selected courses
  const [selectedCourses, setSelectedCourses] = useState({});
  const requiredCourses = 5;

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
          <div className="w-2 h-6 rounded bg-yellow-500"></div>
          <div className="text-sm font-medium">
            Selected: {countCompletedSelections(selectedCourses)}/{requiredCourses}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {geCourses.map((course) => (
          <Card 
            key={course.id} 
            className={`overflow-hidden cursor-pointer ${selectedCourses[course.id]?.selected ? 'border-blue-500' : ''}`}
            onClick={() => handleSelectCourse(course.id)}
          >
            <CardContent className="p-0">
              <div className="flex items-start">
                <div className="w-2 h-full bg-yellow-500 flex-shrink-0"></div>
                <div className="flex items-start p-3 flex-grow">
                  <div className="flex-shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      id={`course-${course.id}`}
                      checked={selectedCourses[course.id]?.selected || false}
                      onCheckedChange={() => handleSelectCourse(course.id)}
                    />
                  </div>
                  <div className="ml-3 flex-grow">
                    <CourseItem course={course} type="ge_elective" />
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

export default SelectGEElectives; 