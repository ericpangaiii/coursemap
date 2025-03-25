import { Card, CardContent } from "@/components/ui/card";
import { CircleCheck } from "lucide-react";
import CourseItem from "@/components/CourseItem";

const AssignRequiredCourses = () => {
  // Mock array of required courses with year and semester already assigned
  const requiredCourses = [
    {
      id: 1,
      course_code: "CS 101",
      title: "Introduction to Programming",
      units: 3,
      year: 1,
      semester: 1,
      sem_offered: "First",
      description: "Introduction to programming concepts and problem-solving using a high-level programming language."
    },
    {
      id: 2,
      course_code: "CS 102",
      title: "Object-Oriented Programming",
      units: 3,
      year: 1,
      semester: 2,
      sem_offered: "Second",
      description: "Introduction to object-oriented programming concepts and principles."
    },
    {
      id: 3,
      course_code: "MATH 101",
      title: "Calculus I",
      units: 4,
      year: 1,
      semester: 1,
      sem_offered: "Both",
      description: "Introduction to differential calculus, limits, continuity, and applications."
    },
    {
      id: 4,
      course_code: "MATH 102",
      title: "Calculus II",
      units: 4,
      year: 1,
      semester: 2,
      sem_offered: "Both",
      description: "Introduction to integral calculus, techniques of integration, and applications."
    },
    {
      id: 5,
      course_code: "CS 110",
      title: "Computer Organization",
      units: 3,
      year: 2,
      semester: 1,
      sem_offered: "First",
      description: "Basic computer organization, CPU, memory, I/O, and assembly language programming."
    },
    {
      id: 6,
      course_code: "CS 120",
      title: "Data Structures",
      units: 3,
      year: 2,
      semester: 1,
      sem_offered: "First",
      description: "Implementation and application of basic data structures like arrays, linked lists, stacks, queues, trees, and graphs."
    }
  ];

  // Group courses by year and semester
  const organizedCourses = {};
  
  requiredCourses.forEach(course => {
    const year = course.year;
    const semester = course.semester;
    
    if (!organizedCourses[year]) {
      organizedCourses[year] = {};
    }
    
    if (!organizedCourses[year][semester]) {
      organizedCourses[year][semester] = [];
    }
    
    organizedCourses[year][semester].push(course);
  });

  // Function to get semester name
  const getSemesterName = (sem) => {
    switch (sem) {
      case 1: return "First Semester";
      case 2: return "Second Semester";
      case 3: return "Midyear";
      default: return `Semester ${sem}`;
    }
  };
  
  return (
    <div className="space-y-4">      
      {Object.keys(organizedCourses).sort().map(year => (
        <div key={year} className="space-y-3">
          <h3 className="text-lg font-medium">Year {year}</h3>
          
          {Object.keys(organizedCourses[year]).sort().map(semester => (
            <div key={`${year}-${semester}`} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500">{getSemesterName(parseInt(semester))}</h4>
              
              <div className="space-y-2">
                {organizedCourses[year][semester].map(course => (
                  <Card key={course.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-start">
                        <div className="w-2 h-full bg-green-500 flex-shrink-0"></div>
                        <div className="flex items-start p-3 flex-grow">
                          <div className="mr-3 pt-1 text-green-500">
                            <CircleCheck className="h-5 w-5" />
                          </div>
                          <div className="flex-grow">
                            <CourseItem course={course} type="required" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AssignRequiredCourses; 