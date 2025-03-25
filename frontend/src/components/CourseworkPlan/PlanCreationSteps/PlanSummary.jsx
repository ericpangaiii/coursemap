import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const PlanSummary = () => {
  // Mock data representing user selections from previous steps
  // This would be passed down from the parent component
  const selectedCoursework = {
    // Required courses (already assigned)
    requiredCourses: [
      {
        id: 1,
        course_code: "CS 101",
        title: "Introduction to Programming",
        units: 3,
        year: 1,
        semester: 1
      },
      {
        id: 2,
        course_code: "CS 102",
        title: "Object-Oriented Programming",
        units: 3,
        year: 1,
        semester: 2
      },
      {
        id: 3,
        course_code: "MATH 101",
        title: "Calculus I",
        units: 4,
        year: 1,
        semester: 1
      },
      {
        id: 4,
        course_code: "MATH 102",
        title: "Calculus II",
        units: 4,
        year: 1,
        semester: 2
      },
      {
        id: 5,
        course_code: "CS 110",
        title: "Computer Organization",
        units: 3,
        year: 2,
        semester: 1
      },
      {
        id: 6,
        course_code: "CS 120",
        title: "Data Structures",
        units: 3,
        year: 2,
        semester: 1
      }
    ],
    // User selections from previous steps
    geElectives: [
      {
        id: 1,
        course_code: "GE MATH 1",
        title: "Mathematics, Culture and Society",
        units: 3,
        year: 1,
        semester: 1
      },
      {
        id: 3,
        course_code: "GE ETHICS 1",
        title: "Ethics and Moral Reasoning in Everyday Life",
        units: 3,
        year: 2,
        semester: 2
      },
      {
        id: 4,
        course_code: "GE KAS 1",
        title: "Kasaysayan ng Pilipinas",
        units: 3,
        year: 3,
        semester: 1
      },
      {
        id: 5,
        course_code: "GE COMM 10",
        title: "Critical Perspectives in Communication",
        units: 3,
        year: 3,
        semester: 2
      },
      {
        id: 6,
        course_code: "GE STS 1",
        title: "Science, Technology, and Society",
        units: 3,
        year: 4,
        semester: 1
      }
    ],
    electives: [
      {
        id: 101,
        course_code: "ELEC 101",
        title: "Web Development",
        units: 3,
        year: 3,
        semester: 1
      },
      {
        id: 102,
        course_code: "ELEC 102",
        title: "Mobile App Development",
        units: 3,
        year: 3,
        semester: 2
      },
      {
        id: 103,
        course_code: "ELEC 103",
        title: "Game Development",
        units: 3,
        year: 4,
        semester: 2
      }
    ],
    majorCourses: [
      {
        id: 201,
        course_code: "CS 180",
        title: "Introduction to Software Engineering",
        units: 3,
        year: 2,
        semester: 2
      },
      {
        id: 202,
        course_code: "CS 192",
        title: "Software Development Project 1",
        units: 3,
        year: 3,
        semester: 1
      },
      {
        id: 203,
        course_code: "CS 145",
        title: "Computer Networks",
        units: 3,
        year: 4,
        semester: 1
      },
      {
        id: 204,
        course_code: "CS 165",
        title: "Data Structures and Algorithms",
        units: 3,
        year: 4,
        semester: 2
      }
    ]
  };

  // Combine all courses into one array
  const allCourses = [
    ...selectedCoursework.requiredCourses,
    ...selectedCoursework.geElectives,
    ...selectedCoursework.electives,
    ...selectedCoursework.majorCourses
  ];

  // Organize courses by year and semester
  const organizedCourses = {};
  
  allCourses.forEach(course => {
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
      case "M": case 3: return "Midyear";
      default: return `Semester ${sem}`;
    }
  };
  
  // Calculate total units per semester and check for warnings
  const warnings = [];
  
  Object.keys(organizedCourses).forEach(year => {
    Object.keys(organizedCourses[year]).forEach(semester => {
      const courses = organizedCourses[year][semester];
      const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);
      
      // Check for overloaded semesters
      if (totalUnits > 18) {
        warnings.push(`Year ${year}, ${getSemesterName(parseInt(semester))} has ${totalUnits} units, which exceeds the recommended 18 units per semester.`);
      }
      
      // Store total units in the first course object for easy access later
      if (courses.length > 0) {
        courses.totalUnits = totalUnits;
      }
    });
  });
  
  // Function to get color based on course type
  const getCourseTypeColor = (courseCode) => {
    if (courseCode.startsWith("GE ")) {
      return "bg-yellow-500";
    } else if (courseCode.startsWith("ELEC ")) {
      return "bg-purple-500";
    } else if (courseCode.startsWith("CS ")) {
      return "bg-red-500";
    } else {
      return "bg-green-500";
    }
  };

  // Calculate total units
  const totalUnits = allCourses.reduce((sum, course) => sum + course.units, 0);

  return (
    <div className="space-y-6">
      {/* Semester-by-semester plan */}
      <div className="space-y-8">
        {Object.keys(organizedCourses).sort().map(year => (
          <div key={year} className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Year {year}</h3>
            
            {Object.keys(organizedCourses[year]).sort().map(semester => {
              const courses = organizedCourses[year][semester];
              const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);
              
              return (
                <div key={`${year}-${semester}`} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">{getSemesterName(parseInt(semester))}</h4>
                    <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded-md">
                      {totalUnits} units
                    </span>
                  </div>

                  <Card className="border-gray-200">
                    <CardContent className="p-3 divide-y divide-gray-100">
                      {courses.map((course, index) => (
                        <div key={`${course.id}-${index}`} className="flex items-center py-2 first:pt-0 last:pb-0">
                          <div className={`w-2 h-5 rounded ${getCourseTypeColor(course.course_code)}`}></div>
                          <div className="ml-2 flex-grow">
                            <div className="text-sm font-medium">{course.course_code}: {course.title}</div>
                            <div className="text-xs text-gray-500">{course.units} units</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="border border-amber-200 rounded-md bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-medium text-amber-800">Potential Issues</h3>
          </div>
          <ul className="space-y-2 text-sm text-amber-800">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-500 text-lg leading-none">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Summary</h3>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Required Courses:</span>
                <span>{selectedCoursework.requiredCourses.length} ({selectedCoursework.requiredCourses.reduce((sum, course) => sum + course.units, 0)} units)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">GE Electives:</span>
                <span>{selectedCoursework.geElectives.length} ({selectedCoursework.geElectives.reduce((sum, course) => sum + course.units, 0)} units)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Electives:</span>
                <span>{selectedCoursework.electives.length} ({selectedCoursework.electives.reduce((sum, course) => sum + course.units, 0)} units)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Major Courses:</span>
                <span>{selectedCoursework.majorCourses.length} ({selectedCoursework.majorCourses.reduce((sum, course) => sum + course.units, 0)} units)</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="font-semibold">{allCourses.length} ({totalUnits} units)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanSummary; 