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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, computeSemesterGWA, getCourseTypeName, getScholarshipEligibility, sortCourses, isSemesterOverloaded, isSemesterUnderloaded, getSemesterName } from "@/lib/utils";
import { AlertTriangle, Award, BookOpen, Calendar, Check, ChevronDown, ChevronRight, Filter, SearchX, X } from "lucide-react";
import { useEffect, useState } from "react";
import { gradeToastFunctions } from "@/lib/toast";

const formatOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const SemesterDetailsModal = ({ isOpen, onClose, year, semester, courses, onGradeChange }) => {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [coursesState, setCourses] = useState(courses);
  const [isWarningsExpanded, setIsWarningsExpanded] = useState(false);

  // Update local state when courses prop changes
  useEffect(() => {
    setCourses(courses);
  }, [courses]);

  const handleGradeChange = async (planCourseId, newGrade) => {
    try {
      // Update the grade in the local state
      const updatedCourses = coursesState.map(course => 
        course.plan_course_id === planCourseId ? { ...course, grade: newGrade } : course
      );
      setCourses(updatedCourses);
      
      // Pass the grade change up to the parent
      if (onGradeChange) {
        await onGradeChange(planCourseId, newGrade);
      }
      
      // Show success toast
      gradeToastFunctions.updateSuccess();
    } catch (error) {
      console.error("Error updating grade:", error);
      // Show error toast
      gradeToastFunctions.updateError();
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
    if (course.grade && !['5.00', 'INC', 'DRP'].includes(course.grade)) {
      courseTypeStats[type].completed += units;
    } else {
      courseTypeStats[type].planned += units;
    }
  });

  // Get unique course types from the semester's courses
  const courseTypes = [...new Set(coursesState.map(course => course.course_type))].sort();

  // Filter courses based on selected filters
  const filteredCourses = coursesState.filter((course) => {
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(course.course_type);
    const statusMatch = selectedStatuses.length === 0 || 
      (selectedStatuses.includes('completed') && course.grade && !['5.00', 'INC', 'DRP'].includes(course.grade)) ||
      (selectedStatuses.includes('taken') && course.grade && ['5.00', 'INC', 'DRP'].includes(course.grade)) ||
      (selectedStatuses.includes('planned') && !course.grade);
    return typeMatch && statusMatch;
  });

  // Sort the filtered courses
  const sortedCourses = sortCourses(filteredCourses);

  // Calculate GWA
  const semesterGWA = computeSemesterGWA(coursesState);

  // Generate warnings
  const generateWarnings = () => {
    const warnings = {
      underload: null,
      overload: null,
      failingGrades: [],
      incompleteGrades: [],
      droppedCourses: []
    };
    
    // Check for failing grades (5.00, INC, DRP)
    const failingGrades = coursesState.filter(course => 
      ['5.00', 'INC', 'DRP'].includes(course.grade)
    );

    failingGrades.forEach(course => {
      if (course.grade === '5.00') {
        warnings.failingGrades.push({
          courseCode: course.course_code,
          details: "must be retaken"
        });
      } else if (course.grade === 'INC') {
        const nextYear = year + 1;
        const nextYearOrdinal = formatOrdinal(nextYear);
        const semesterName = semester === 3 ? 'Mid Year' : `${formatOrdinal(semester)}`;
        warnings.incompleteGrades.push({
          courseCode: course.course_code,
          details: `must be completed before end of ${nextYearOrdinal} Year ${semesterName} Sem`
        });
      } else if (course.grade === 'DRP') {
        warnings.droppedCourses.push({
          courseCode: course.course_code,
          details: "must be retaken"
        });
      }
    });
    
    // Calculate academic units (excluding required_non_academic and DRP courses)
    const academicUnits = coursesState.reduce((total, course) => {
      if (course.grade === 'DRP' && course.course_type !== 'required_non_academic') {
        return total;
      }
      if (course.is_academic && !course._isCurriculumCourse) {
        return total + (parseInt(course.units) || 0);
      }
      return total;
    }, 0);
    
    // Check for overload/underload based on semester
    const semesterType = semester === 3 ? 'Mid Year' : semester.toString();
    if (isSemesterOverloaded(academicUnits, semesterType)) {
      const maxUnits = semesterType === "Mid Year" ? 6 : 18;
      warnings.overload = {
        details: `${academicUnits} units (max ${maxUnits} allowed, must file overload permit)`
      };
    } else if (isSemesterUnderloaded(academicUnits, semesterType)) {
      warnings.underload = {
        details: `${academicUnits} units (min 15 required, must file underload permit)`
      };
    }
    
    return warnings;
  };

  const warnings = generateWarnings();
  const hasWarnings = warnings.overload || warnings.underload || 
                      warnings.failingGrades.length > 0 || 
                      warnings.incompleteGrades.length > 0 || 
                      warnings.droppedCourses.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-xl")}>
        <DialogHeader>
          <div>
            <DialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {formatOrdinal(year)} Year {getSemesterName(semester)} Details
            </DialogTitle>
            <div className="flex justify-between items-center mt-1">
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                    {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-2 ${
                        selectedTypes.length > 0 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      } hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]`}
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Course Type
                      {selectedTypes.length > 0 && (
                        <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {selectedTypes.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                    <div 
                      className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                        selectedTypes.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                      }`}
                      onClick={() => selectedTypes.length > 0 && setSelectedTypes([])}
                    >
                      <X className="w-3 h-3" />
                      <span className="text-xs">Clear</span>
                    </div>
                    {courseTypes.map(type => {
                      const isSelected = selectedTypes.includes(type);
                      return (
                        <DropdownMenuItem 
                          key={type} 
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedTypes(prev => 
                              isSelected 
                                ? prev.filter(t => t !== type)
                                : [...prev, type]
                            );
                          }}
                          className="flex items-center gap-2 py-1.5 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-3 w-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700 dark:text-gray-200">{getCourseTypeName(type)}</span>
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
                      className={`h-8 px-2 ${
                        selectedStatuses.length > 0 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      } hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]`}
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Status
                      {selectedStatuses.length > 0 && (
                        <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {selectedStatuses.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                    <div 
                      className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                        selectedStatuses.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                      }`}
                      onClick={() => selectedStatuses.length > 0 && setSelectedStatuses([])}
                    >
                      <X className="w-3 h-3" />
                      <span className="text-xs">Clear</span>
                    </div>
                    {['planned', 'completed', 'taken'].map((status) => {
                      const isSelected = selectedStatuses.includes(status);
                      const label = status === 'planned' ? 'Planned' : 
                                  status === 'completed' ? 'Completed' : 
                                  'Taken';
                      return (
                        <DropdownMenuItem 
                          key={status}
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedStatuses(prev => 
                              isSelected 
                                ? prev.filter(s => s !== status)
                                : [...prev, status]
                            );
                          }}
                          className="flex items-center gap-2 py-1.5 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-3 w-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700 dark:text-gray-200">{label}</span>
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
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        enableGradeSelection={true}
                        onGradeChange={handleGradeChange}
                        isInCoursesList={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-500 dark:text-gray-400">
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
                    <Award className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Semester GWA
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col items-center gap-0.5">
                    <Badge variant="outline" className="h-7 text-base bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 font-semibold">
                      {semesterGWA.toFixed(2)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <Award className="h-3 w-3" />
                      {getScholarshipEligibility(semesterGWA)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warnings Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Warnings
                    </CardTitle>
                    <div className={`${hasWarnings ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'} rounded-md w-5 h-5 flex items-center justify-center text-xs font-medium`}>
                      {[
                        warnings.overload ? 1 : 0,
                        warnings.underload ? 1 : 0,
                        warnings.failingGrades.length,
                        warnings.incompleteGrades.length,
                        warnings.droppedCourses.length
                      ].reduce((a, b) => a + b, 0)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsWarningsExpanded(!isWarningsExpanded)}
                    className="h-6 w-6 p-0"
                  >
                    {isWarningsExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {isWarningsExpanded && (
                <CardContent>
                  {hasWarnings ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Warning Type</TableHead>
                          <TableHead className="text-center text-xs">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Overload warning */}
                        {warnings.overload && (
                          <TableRow>
                            <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300 w-1/2">Overload</TableCell>
                            <TableCell className="text-xs text-gray-500 dark:text-gray-400 text-center w-1/2">{warnings.overload.details}</TableCell>
                          </TableRow>
                        )}

                        {/* Underload warning */}
                        {warnings.underload && (
                          <TableRow>
                            <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300 w-1/2">Underload</TableCell>
                            <TableCell className="text-xs text-gray-500 dark:text-gray-400 text-center w-1/2">{warnings.underload.details}</TableCell>
                          </TableRow>
                        )}

                        {/* Failing grades */}
                        {warnings.failingGrades.map((course, idx) => (
                          <TableRow key={`failed-${idx}`}>
                            <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300 w-1/2">Failed Course</TableCell>
                            <TableCell className="text-xs text-gray-500 dark:text-gray-400 text-center w-1/2">
                              {course.courseCode} ({course.details})
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* Incomplete grades */}
                        {warnings.incompleteGrades.map((course, idx) => (
                          <TableRow key={`inc-${idx}`}>
                            <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300 w-1/2">Incomplete Grade</TableCell>
                            <TableCell className="text-xs text-gray-500 dark:text-gray-400 text-center w-1/2">
                              {course.courseCode} ({course.details})
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* Dropped courses */}
                        {warnings.droppedCourses.map((course, idx) => (
                          <TableRow key={`dropped-${idx}`}>
                            <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300 w-1/2">Dropped Course</TableCell>
                            <TableCell className="text-xs text-gray-500 dark:text-gray-400 text-center w-1/2">
                              {course.courseCode} ({course.details})
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No issues detected in this semester.</p>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SemesterDetailsModal; 