import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSemesterName, getCourseTypeColor, sortCourses, getNormalizedCourseType } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import { useState } from "react";
import SemesterDetailsModal from "./SemesterDetailsModal";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

const CompactSemesterCard = ({ semester, courses, year }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Determine if this is a midyear semester (semester 3)
  const isMidyear = semester === 3;

  // Calculate total units for academic and non-academic courses
  const academicUnits = courses
    .filter(course => course.is_academic)
    .reduce((sum, course) => sum + Number(course.units || 0), 0);

  const nonAcademicUnits = courses
    .filter(course => !course.is_academic)
    .reduce((sum, course) => sum + Number(course.units || 0), 0);

  // Sort the courses
  const sortedCourses = sortCourses(courses);

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
            {courses.length > 0 ? (
              <div className="space-y-1.5">
                {sortedCourses.map((course) => (
                  <div
                    key={course.course_id}
                    className="text-xs px-2 py-1.5 rounded bg-gray-50 flex items-center justify-between relative overflow-hidden"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${getCourseTypeColor(getNormalizedCourseType(course.course_type))}`} />
                    <span className="font-medium ml-1.5">{course.course_code}</span>
                    <span className="text-gray-500">{course.units}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center py-1">Empty</div>
            )}
          </div>
          {courses.length > 0 && (
            <div className="mt-1 pt-1 border-t flex justify-end space-x-3 text-[10px] text-gray-500">
              <div>{`${academicUnits} / ${nonAcademicUnits} units`}</div>
            </div>
          )}
        </CardContent>
      </Card>
      <SemesterDetailsModal 
        semester={semester}
        year={year}
        courses={sortedCourses}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="sm:max-w-2xl"
      />
    </>
  );
};

export default CompactSemesterCard; 