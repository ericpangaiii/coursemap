import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CourseItem from "@/components/CourseItem";
import { Calendar, CheckCircle2, Filter } from "lucide-react";
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
import { getCourseTypeColor, getCourseTypeName } from "@/lib/utils";

const formatOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const SemesterDetailsModal = ({ semester, year, courses, isOpen, onClose, className }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Calculate total units for all course types
  const courseTypeStats = {};
  courses.forEach(course => {
    const type = course.course_type;
    if (!courseTypeStats[type]) {
      courseTypeStats[type] = {
        planned: 0,
        completed: 0,
        units: 0
      };
    }
    if (course.is_completed) {
      courseTypeStats[type].completed++;
    } else {
      courseTypeStats[type].planned++;
    }
    courseTypeStats[type].units += Number(course.units || 0);
  });

  // Get unique course types from the semester's courses
  const courseTypes = [...new Set(courses.map(course => course.course_type))].sort();

  // Filter courses based on selected type and status
  const filteredCourses = courses.filter(course => {
    const typeMatch = !selectedType || course.course_type === selectedType;
    const statusMatch = !selectedStatus || 
      (selectedStatus === 'completed' && course.is_completed) ||
      (selectedStatus === 'planned' && !course.is_completed);
    return typeMatch && statusMatch;
  });

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
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
                </span>
              </DialogDescription>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-gray-500 hover:text-blue-600"
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      {selectedType ? getCourseTypeName(selectedType) : "All Types"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem 
                      onClick={() => setSelectedType(null)}
                      className="flex items-center gap-2"
                    >
                      <div className="w-1 h-4 rounded bg-gray-300" />
                      All Types
                    </DropdownMenuItem>
                    {courseTypes.map(type => (
                      <DropdownMenuItem 
                        key={type} 
                        onClick={() => setSelectedType(type)}
                        className="flex items-center gap-2"
                      >
                        <div className={`w-1 h-4 rounded ${getCourseTypeColor(type)}`} />
                        {getCourseTypeName(type)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-gray-500 hover:text-blue-600"
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      {selectedStatus 
                        ? (selectedStatus === 'planned' ? 'Planned' : 'Completed')
                        : "All Statuses"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => setSelectedStatus(null)}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-1 h-4 rounded ${!selectedStatus ? 'bg-gray-900' : 'bg-gray-200'}`} />
                      All Statuses
                    </DropdownMenuItem>
                    {['planned', 'completed'].map((status) => {
                      const isSelected = selectedStatus === status;
                      const label = status === 'planned' ? 'Planned' : 'Completed';
                      return (
                        <DropdownMenuItem 
                          key={status}
                          onClick={() => setSelectedStatus(status)}
                          className="flex items-center gap-2"
                        >
                          <div className={`w-1 h-4 rounded ${isSelected ? 'bg-gray-900' : 'bg-gray-200'}`} />
                          {label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4">
            {/* Courses Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredCourses.length > 0 ? (
                  <div className="space-y-2">
                    {filteredCourses.map((course) => (
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
                    <p className="text-sm font-medium">No courses found</p>
                    <p className="text-sm">Try adjusting your filters</p>
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
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-500">Type</th>
                      <th className="text-center py-2 font-medium text-gray-500">Planned</th>
                      <th className="text-center py-2 font-medium text-gray-500">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseTypes.map(type => (
                      <tr key={type} className="border-b border-gray-100">
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-1 h-4 rounded ${getCourseTypeColor(type)}`} />
                            {getCourseTypeName(type)}
                          </div>
                        </td>
                        <td className="text-center py-2">{courseTypeStats[type].planned}</td>
                        <td className="text-center py-2">{courseTypeStats[type].completed}</td>
                      </tr>
                    ))}
                    <tr className="font-medium">
                      <td className="py-2">Total</td>
                      <td className="text-center py-2">
                        {Object.values(courseTypeStats).reduce((sum, stat) => sum + stat.planned, 0)}
                      </td>
                      <td className="text-center py-2">
                        {Object.values(courseTypeStats).reduce((sum, stat) => sum + stat.completed, 0)}
                      </td>
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