import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CourseItem from "@/components/CourseItem";
import { Calendar, CheckCircle2, Filter, FileText, Award } from "lucide-react";
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
import { useState, useEffect } from "react";
import { getCourseTypeColor, getCourseTypeName, computeSemesterGWA, getScholarshipEligibility } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const formatOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const SemesterDetailsModal = ({ isOpen, onClose, year, semester, courses, onGradeChange }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [coursesState, setCourses] = useState(courses);

  // Update local state when courses prop changes
  useEffect(() => {
    setCourses(courses);
  }, [courses]);

  const handleGradeChange = async (courseId, newGrade) => {
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

  // Calculate total units for all course types
  const courseTypeStats = {};
  coursesState.forEach(course => {
    const type = course.course_type;
    if (!courseTypeStats[type]) {
      courseTypeStats[type] = {
        total: 0,
        completed: 0,
        planned: 0
      };
    }
    const units = Number(course.units || 0);
    courseTypeStats[type].total += units;
    // Course is completed if it has a grade that is not 5, INC, or DRP
    if (course.grade && !['5', 'INC', 'DRP'].includes(course.grade)) {
      courseTypeStats[type].completed += units;
    } else {
      courseTypeStats[type].planned += units;
    }
  });

  // Get unique course types from the semester's courses
  const courseTypes = [...new Set(coursesState.map(course => course.course_type))].sort();

  // Filter courses based on selected filters
  const filteredCourses = coursesState.filter((course) => {
    const typeMatch = !selectedType || course.course_type === selectedType;
    const statusMatch = !selectedStatus || 
      (selectedStatus === 'completed' && course.grade && !['5.00', 'INC', 'DRP'].includes(course.grade)) ||
      (selectedStatus === 'taken' && course.grade && ['5.00', 'INC', 'DRP'].includes(course.grade)) ||
      (selectedStatus === 'planned' && !course.grade);
    return typeMatch && statusMatch;
  });

  // Calculate GWA
  const semesterGWA = computeSemesterGWA(coursesState);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-xl")}>
        <DialogHeader>
          <div>
            <DialogTitle className="text-lg font-medium">
              {formatOrdinal(year)} Year {formatOrdinal(semester)} Semester Details
            </DialogTitle>
            <div className="flex justify-between items-center mt-1">
              <DialogDescription className="pb-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
                  </span>
                </div>
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
                      <div className={`w-1 h-4 rounded ${!selectedType ? 'bg-gray-900' : 'bg-gray-200'}`} />
                      All Types
                    </DropdownMenuItem>
                    {courseTypes.map(type => {
                      const isSelected = selectedType === type;
                      return (
                        <DropdownMenuItem 
                          key={type} 
                          onClick={() => setSelectedType(type)}
                          className="flex items-center gap-2"
                        >
                          <div className={`w-1 h-4 rounded ${isSelected ? 'bg-gray-900' : 'bg-gray-200'}`} />
                          {getCourseTypeName(type)}
                        </DropdownMenuItem>
                      );
                    })}
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
                        ? (selectedStatus === 'planned' ? 'Planned' : 
                           selectedStatus === 'completed' ? 'Completed' : 
                           'Taken')
                        : "All Statuses"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => setSelectedStatus(null)}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-1 h-4 rounded ${!selectedStatus ? 'bg-gray-900' : 'bg-gray-200'}`} />
                      All Statuses
                    </DropdownMenuItem>
                    {['planned', 'completed', 'taken'].map((status) => {
                      const isSelected = selectedStatus === status;
                      const label = status === 'planned' ? 'Planned' : 
                                  status === 'completed' ? 'Completed' : 
                                  'Taken';
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
                        enableGradeSelection={true}
                        onGradeChange={handleGradeChange}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                    <FileText className="h-8 w-8 mb-2" />
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
                {semesterGWA !== null && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-sm font-medium text-gray-500">Semester GWA</div>
                      <Badge variant="outline" className="h-8 text-base bg-blue-50 text-blue-600 font-semibold">
                        {semesterGWA.toFixed(2)}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Award className="h-3 w-3" />
                        {getScholarshipEligibility(semesterGWA)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SemesterDetailsModal; 