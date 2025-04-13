import CourseItem from "@/components/CourseItem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, computeSemesterGWA, getCourseTypeName, getScholarshipEligibility, sortCourses, isSemesterOverloaded, isSemesterUnderloaded, getSemesterName } from "@/lib/utils";
import { AlertTriangle, Award, BookOpen, Calendar, Check, ChevronDown, Filter, SearchX } from "lucide-react";
import { useEffect, useState } from "react";

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

  // Sort the filtered courses
  const sortedCourses = sortCourses(filteredCourses);

  // Calculate GWA
  const semesterGWA = computeSemesterGWA(coursesState);

  // Generate warnings
  const generateWarnings = () => {
    const warnings = [];
    
    // Check for failing grades (5.00, INC, DRP)
    const failingGrades = coursesState.filter(course => 
      ['5.00', 'INC', 'DRP'].includes(course.grade)
    );

    failingGrades.forEach(course => {
      if (course.grade === '5.00') {
        warnings.push({
          text: "Failed Course",
          details: `${course.course_code} (must be retaken)`
        });
      } else if (course.grade === 'INC') {
        const nextYear = year + 1;
        const nextYearOrdinal = formatOrdinal(nextYear);
        const semesterName = semester === 3 ? 'Mid Year' : `${formatOrdinal(semester)}`;
        warnings.push({
          text: "Incomplete Grade",
          details: `${course.course_code} (must be completed before end of ${nextYearOrdinal} Year ${semesterName} Sem)`
        });
      } else if (course.grade === 'DRP') {
        warnings.push({
          text: "Dropped Course",
          details: `${course.course_code} (must be retaken)`
        });
      }
    });
    
    // Calculate academic units (excluding required_non_academic and DRP courses)
    const academicUnits = coursesState.reduce((total, course) => {
      // Skip if course is dropped (DRP) and not required non-academic
      if (course.grade === 'DRP' && course.course_type !== 'required_non_academic') {
        return total;
      }
      // Only count academic courses' units
      if (course.is_academic && !course._isCurriculumCourse) {
        return total + (parseInt(course.units) || 0);
      }
      return total;
    }, 0);
    
    // Check for overload/underload based on semester
    const semesterType = semester === 3 ? 'Mid Year' : semester.toString();
    if (isSemesterOverloaded(academicUnits, semesterType)) {
      const maxUnits = semesterType === "Mid Year" ? 6 : 18;
      warnings.push({
        text: "Overload",
        details: `${academicUnits} units (max ${maxUnits} allowed, must file overload permit)`
      });
    } else if (isSemesterUnderloaded(academicUnits, semesterType)) {
      warnings.push({
        text: "Underload",
        details: `${academicUnits} units (min 15 required, must file underload permit)`
      });
    }
    
    return warnings;
  };

  const warnings = generateWarnings();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-xl")}>
        <DialogHeader>
          <div>
            <DialogTitle className="text-lg font-medium">
              {formatOrdinal(year)} Year {getSemesterName(semester)} Details
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
                  <DropdownMenuContent align="end" className="min-w-[8rem]">
                    <DropdownMenuItem 
                      onClick={() => setSelectedType(null)}
                      className="flex items-center gap-2 py-1.5"
                    >
                      <div className={`w-1 h-3 rounded ${!selectedType ? 'bg-gray-900' : 'bg-gray-200'}`} />
                      <span className="text-xs">All Types</span>
                    </DropdownMenuItem>
                    {courseTypes.map(type => {
                      const isSelected = selectedType === type;
                      return (
                        <DropdownMenuItem 
                          key={type} 
                          onClick={() => setSelectedType(type)}
                          className="flex items-center gap-2 py-1.5"
                        >
                          <div className={`w-1 h-3 rounded ${isSelected ? 'bg-gray-900' : 'bg-gray-200'}`} />
                          <span className="text-xs">{getCourseTypeName(type)}</span>
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
                  <DropdownMenuContent align="start" className="min-w-[7rem]">
                    <DropdownMenuItem 
                      onClick={() => setSelectedStatus(null)}
                      className="flex items-center gap-2 py-1.5"
                    >
                      <div className={`w-1 h-3 rounded ${!selectedStatus ? 'bg-gray-900' : 'bg-gray-200'}`} />
                      <span className="text-xs">All Statuses</span>
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
                          className="flex items-center gap-2 py-1.5"
                        >
                          <div className={`w-1 h-3 rounded ${isSelected ? 'bg-gray-900' : 'bg-gray-200'}`} />
                          <span className="text-xs">{label}</span>
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
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Courses
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {sortedCourses.length > 0 ? (
                  <div className="space-y-2">
                    {sortedCourses.map((course) => (
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
                    <SearchX className="h-8 w-8 mb-2" />
                    <p className="text-sm font-medium">No courses found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Semester GWA Card */}
            {semesterGWA !== null && (
              <Card>
                <CardHeader className="pb-1">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-500" />
                    <CardTitle className="text-sm font-medium text-gray-700">
                      Semester GWA
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col items-center gap-0.5">
                    <Badge variant="outline" className="h-7 text-base bg-blue-50 text-blue-600 font-semibold">
                      {semesterGWA.toFixed(2)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Award className="h-3 w-3" />
                      {getScholarshipEligibility(semesterGWA)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warnings Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Warnings
                  </CardTitle>
                  <div className={`rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium ${
                    warnings.length > 0 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {warnings.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {warnings.length > 0 ? (
                  <div className="space-y-2">
                    {warnings.map((warning, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-700">{warning.text}</p>
                        <p className="text-xs text-gray-500">{warning.details}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No issues detected in this semester.</p>
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