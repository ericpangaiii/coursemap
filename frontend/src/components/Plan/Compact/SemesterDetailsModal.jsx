import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CourseItem from "@/components/CourseItem";
import { Calendar, CircleDashed, Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const formatCourseType = (type) => {
  // Special cases
  if (type === 'GE ELECTIVE') return 'GE Elective';
  if (type === 'REQUIRED_NON_ACADEMIC') return 'Required Non-Academic';
  
  // Handle other course types
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const formatOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const SemesterDetailsModal = ({ semester, year, courses, isOpen, onClose, className }) => {
  const [selectedType, setSelectedType] = useState(null);

  // Calculate total units for academic and non-academic courses
  const academicUnits = courses
    .filter(course => course.is_academic)
    .reduce((sum, course) => sum + Number(course.units || 0), 0);

  const nonAcademicUnits = courses
    .filter(course => !course.is_academic)
    .reduce((sum, course) => sum + Number(course.units || 0), 0);

  // Calculate planned and completed counts
  const plannedCourses = courses.filter(course => !course.is_completed);
  const completedCourses = courses.filter(course => course.is_completed);

  const plannedAcademicUnits = plannedCourses
    .filter(course => course.is_academic)
    .reduce((sum, course) => sum + Number(course.units || 0), 0);

  const plannedNonAcademicUnits = plannedCourses
    .filter(course => !course.is_academic)
    .reduce((sum, course) => sum + Number(course.units || 0), 0);

  const completedAcademicUnits = completedCourses
    .filter(course => course.is_academic)
    .reduce((sum, course) => sum + Number(course.units || 0), 0);

  const completedNonAcademicUnits = completedCourses
    .filter(course => !course.is_academic)
    .reduce((sum, course) => sum + Number(course.units || 0), 0);

  // Get unique course types from the semester's courses
  const courseTypes = [...new Set(courses.map(course => course.course_type))].sort();

  // Filter courses based on selected type
  const filteredPlannedCourses = selectedType 
    ? plannedCourses.filter(course => course.course_type === selectedType)
    : plannedCourses;

  const filteredCompletedCourses = selectedType 
    ? completedCourses.filter(course => course.course_type === selectedType)
    : completedCourses;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-2xl", className)}>
        <DialogHeader>
          <div>
            <DialogTitle className="text-lg font-medium">
              {formatOrdinal(year)} Year {formatOrdinal(semester)} Semester Details
            </DialogTitle>
            <div className="flex justify-between items-center mt-1">
              <DialogDescription className="pb-1">
                View courses for this semester
              </DialogDescription>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-gray-500 hover:text-blue-600"
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    {selectedType ? formatCourseType(selectedType) : "All Types"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedType(null)}>
                    All Types
                  </DropdownMenuItem>
                  {courseTypes.map(type => (
                    <DropdownMenuItem 
                      key={type} 
                      onClick={() => setSelectedType(type)}
                    >
                      {formatCourseType(type)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4">
            {/* Planned Courses Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Planned Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPlannedCourses.length > 0 ? (
                  <div className="space-y-2">
                    {filteredPlannedCourses.map((course) => (
                      <CourseItem 
                        key={course.course_id}
                        course={course}
                        type={course.course_type}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                    <Calendar className="h-8 w-8 mb-2" />
                    <p className="text-sm font-medium">No courses planned</p>
                    <p className="text-sm">Add courses to this semester</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Courses Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Completed Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredCompletedCourses.length > 0 ? (
                  <div className="space-y-2">
                    {filteredCompletedCourses.map((course) => (
                      <CourseItem 
                        key={course.course_id}
                        course={course}
                        type={course.course_type}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                    <CircleDashed className="h-8 w-8 mb-2" />
                    <p className="text-sm font-medium">No completed courses</p>
                    <p className="text-sm">Courses are still in progress</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Type</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-500">Planned</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-500">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-sm text-gray-700">Academic</td>
                      <td className="py-2 text-sm text-center text-gray-700">{plannedAcademicUnits}</td>
                      <td className="py-2 text-sm text-center text-gray-700">{completedAcademicUnits}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-sm text-gray-700">Non-Academic</td>
                      <td className="py-2 text-sm text-center text-gray-700">{plannedNonAcademicUnits}</td>
                      <td className="py-2 text-sm text-center text-gray-700">{completedNonAcademicUnits}</td>
                    </tr>
                    <tr className="font-bold">
                      <td className="py-2 text-sm text-gray-700">Total</td>
                      <td className="py-2 text-sm text-center text-gray-700">{plannedAcademicUnits + plannedNonAcademicUnits}</td>
                      <td className="py-2 text-sm text-center text-gray-700">{completedAcademicUnits + completedNonAcademicUnits}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SemesterDetailsModal; 