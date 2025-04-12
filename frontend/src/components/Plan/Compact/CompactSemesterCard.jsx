import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSemesterName, getCourseTypeColor, sortCourses, getNormalizedCourseType, getGradeBadgeColor, computeSemesterGWA } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import SemesterDetailsModal from "./SemesterDetailsModal";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CompactSemesterCard = ({ semester, courses, year, onGradeChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coursesState, setCourses] = useState(courses);
  
  // Update local state when courses prop changes
  useEffect(() => {
    setCourses(courses);
  }, [courses]);
  
  // Determine if this is a midyear semester (semester 3)
  const isMidyear = semester === 3;

  // Calculate total units for academic courses
  const academicUnits = coursesState
    .filter(course => course.is_academic)
    .reduce((sum, course) => sum + Number(course.units || 0), 0);

  // Sort the courses
  const sortedCourses = sortCourses(coursesState);

  // Calculate GWA
  const semesterGWA = computeSemesterGWA(coursesState);

  const handleGradeChange = (courseId, newGrade) => {
    // Update the grade in the local state
    const updatedCourses = coursesState.map(course => 
      course.course_id === courseId ? { ...course, grade: newGrade } : course
    );
    setCourses(updatedCourses);
    
    // Pass the grade change up to the parent
    if (onGradeChange) {
      onGradeChange(courseId, newGrade);
    }
  };

  return (
    <>
      <Card className={`w-full ${isMidyear ? 'h-[160px]' : 'h-[360px]'} flex flex-col`}>
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-gray-600">
              {getSemesterName(semester)}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              onClick={() => setIsModalOpen(true)}
            >
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardContent className={`px-2 pt-2 pb-0 flex-1 flex flex-col ${isMidyear ? 'max-h-[100px]' : 'max-h-[300px]'}`}>
          <div className="flex-1 overflow-y-auto">
            {coursesState.length > 0 ? (
              <div className="space-y-1.5">
                {sortedCourses.map((course) => (
                  <div
                    key={course.course_id}
                    className="text-xs px-2 py-1.5 rounded bg-gray-50 flex items-center justify-between relative overflow-hidden"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${!course.is_academic ? 'bg-blue-300' : getCourseTypeColor(getNormalizedCourseType(course.course_type))}`} />
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium ml-1.5">{course.course_code}</span>
                      <div className="flex items-center gap-1">
                        {course.grade && !['5.00', 'INC', 'DRP'].includes(course.grade) && (
                          <Check className="h-3 w-3 text-green-500" />
                        )}
                        {course.grade && (
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] h-5 ${getGradeBadgeColor(course.grade)}`}
                          >
                            {course.grade}
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] h-5 ${!course.is_academic ? 'text-gray-500' : ''}`}
                        >
                          {course.units} units
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center py-1">Empty</div>
            )}
          </div>
          {coursesState.length > 0 && (
            <div className="mt-1 pt-1 border-t flex justify-end space-x-3 text-[10px]">
              <div className="flex items-center gap-2 pr-2">
                {semesterGWA !== null && (
                  <Badge variant="outline" className="h-5 text-[10px] bg-blue-50 text-blue-600 font-semibold">
                    GWA: {semesterGWA.toFixed(2)}
                  </Badge>
                )}
                <Badge variant="outline" className="h-5 text-[10px] bg-gray-50 text-gray-600 font-semibold">
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