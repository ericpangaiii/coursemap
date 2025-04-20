import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeSemesterGWA, getCourseTypeColor, getGradeBadgeColor, getSemesterName, sortCourses } from "@/lib/utils";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import SemesterDetailsModal from "./SemesterDetailsModal";

const CompactSemesterCard = ({ semester, courses, year, onGradeChange, hideDetailsButton = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coursesState, setCourses] = useState(courses);
  
  // Update local state when courses prop changes
  useEffect(() => {
    setCourses(courses);
  }, [courses]);
  
  // Determine if this is a midyear semester (semester 3)
  const isMidyear = semester === 3;

  // Calculate academic units (excluding Required Non-Academic and DRP courses)
  const academicUnits = courses.reduce((total, course) => {
    // Skip if course is dropped (DRP) and not required non-academic
    if (course.grade === 'DRP' && course.course_type !== 'Required Non-Academic') {
      return total;
    }
    // Only count academic courses' units
    if (course.course_type !== 'Required Non-Academic' && !course._isCurriculumCourse) {
      return total + (parseInt(course.units) || 0);
    }
    return total;
  }, 0);

  // Sort the courses
  const sortedCourses = sortCourses(coursesState);

  // Calculate GWA
  const semesterGWA = computeSemesterGWA(coursesState);

  const handleGradeChange = (planCourseId, newGrade) => {
    // Update the grade in the local state
    const updatedCourses = coursesState.map(course => 
      course.id === planCourseId ? { ...course, grade: newGrade } : course
    );
    setCourses(updatedCourses);
    
    // Pass the grade change up to the parent
    if (onGradeChange) {
      onGradeChange(planCourseId, newGrade);
    }
  };

  return (
    <>
      <Card className={`w-full ${isMidyear ? 'h-[160px]' : 'h-[420px]'} flex flex-col`}>
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {getSemesterName(semester)}
            </CardTitle>
            {!hideDetailsButton && (
              <Button
                variant="ghost" 
                size="sm"
                className="h-6 px-2 text-xs text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                onClick={() => setIsModalOpen(true)}
              >
                View Details
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className={`px-2 pt-2 pb-0 flex-1 flex flex-col ${isMidyear ? 'max-h-[100px]' : 'max-h-[360px]'}`}>
          <div className="flex-1 overflow-y-auto">
            {coursesState.length > 0 ? (
              <div className="space-y-1.5">
                {sortedCourses.map((course) => (
                  <div
                    key={course.course_id}
                    className="text-xs px-2 py-1.5 rounded bg-gray-50 dark:bg-[hsl(220,10%,15%)] flex items-center justify-between relative overflow-hidden hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)] active:bg-gray-200 dark:active:bg-[hsl(220,10%,30%)]"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${getCourseTypeColor(course.course_type)}`} />
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium ml-1.5 text-gray-900 dark:text-gray-100">{course.course_code}</span>
                      <div className="flex items-center gap-1.5">
                        {course.grade && !['5.00', 'INC', 'DRP'].includes(course.grade) && (
                          <Check className="h-3 w-3 text-green-500" />
                        )}
                        {course.grade && (
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${getGradeBadgeColor(course.grade)}`}
                          >
                            {course.grade}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-white dark:bg-[hsl(220,10%,15%)] text-gray-700 dark:text-gray-100 border-gray-200 dark:border-[hsl(220,10%,20%)] text-[10px]">
                          {course.units} units
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-1">Empty</div>
            )}
          </div>
          {coursesState.length > 0 && (
            <div className="mt-1 pt-1 border-t dark:border-gray-700 flex justify-end space-x-3 text-[10px]">
              <div className="flex items-center gap-2 pr-2">
                {semesterGWA !== null && (
                  <Badge variant="outline" className="h-5 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold">
                    GWA: {semesterGWA.toFixed(2)}
                  </Badge>
                )}
                <Badge variant="outline" className="h-5 text-[10px] bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold">
                  {academicUnits} units
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <SemesterDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        year={year}
        semester={semester}
        courses={coursesState}
        onGradeChange={handleGradeChange}
      />
    </>
  );
};

export default CompactSemesterCard; 