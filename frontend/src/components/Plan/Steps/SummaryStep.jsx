import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, AlertTriangle, Check, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCourseTypeColor, isSemesterOverloaded, isSemesterUnderloaded } from "@/lib/utils";

// Move generateWarnings function outside of component
const generateWarnings = (planData) => {
  const warnings = [];
  
  // Check for overload and underload in academic units (exclude required_non_academic)
  Object.entries(planData).forEach(([year, yearData]) => {
    Object.entries(yearData).forEach(([sem, courses]) => {
      const academicUnits = courses.reduce((total, course) => {
        // Only count academic courses' units
        if (course.is_academic && !course._isCurriculumCourse) {
          return total + (parseInt(course.units) || 0);
        }
        return total;
      }, 0);
      
      const yearText = year === "1" ? "1st Year" : year === "2" ? "2nd Year" : year === "3" ? "3rd Year" : `${year}th Year`;
      
      if (isSemesterOverloaded(academicUnits, sem)) {
        const maxUnits = sem === "Mid Year" ? 6 : 18;
        warnings.push({
          text: `${yearText}, ${sem}: Overload`,
          details: `${academicUnits} units (max ${maxUnits})`
        });
      } else if (isSemesterUnderloaded(academicUnits, sem)) {
        warnings.push({
          text: `${yearText}, ${sem}: Underload`,
          details: `${academicUnits} units (min 15)`
        });
      }
    });
  });
  
  return warnings;
};

const SummaryStep = ({ planData }) => {
  const [warningsExpanded, setWarningsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState("by-type"); // "by-type" or "by-semester"
  
  const warnings = generateWarnings(planData);
  
  const calculateTypeStats = () => {
    const stats = {
      ge_elective: { count: 0, units: 0 },
      elective: { count: 0, units: 0 },
      major: { count: 0, units: 0 },
      required_academic: { count: 0, units: 0 },
      required_non_academic: { count: 0, units: 0 }
    };

    Object.values(planData).forEach(yearData => {
      Object.values(yearData).forEach(semData => {
        semData.forEach(course => {
          const type = course.course_type;
          if (stats[type]) {
            stats[type].count++;
            stats[type].units += parseInt(course.units || 0, 10);
          }
        });
      });
    });

    return stats;
  };

  const stats = calculateTypeStats();
  
  // Calculate total courses by year and semester
  const semesterBreakdown = {};
  Object.entries(planData).forEach(([year, yearData]) => {
    semesterBreakdown[year] = {};
    Object.entries(yearData).forEach(([sem, courses]) => {
      const academicUnits = courses.reduce((total, course) => {
        if (course.course_type !== 'required_non_academic') {
          return total + (parseInt(course.units) || 0);
        }
        return total;
      }, 0);
      
      const nonAcademicUnits = courses.reduce((total, course) => {
        if (course.course_type === 'required_non_academic') {
          return total + (parseInt(course.units) || 0);
        }
        return total;
      }, 0);
      
      semesterBreakdown[year][sem] = {
        academicCourses: courses.filter(c => c.course_type !== 'required_non_academic').length,
        academicUnits,
        nonAcademicCourses: courses.filter(c => c.course_type === 'required_non_academic').length,
        nonAcademicUnits,
        totalCourses: courses.length,
        totalUnits: academicUnits + nonAcademicUnits
      };
    });
  });
  
  // Calculate total counts (including non-academic)
  const totalUnits = Object.values(stats).reduce((sum, { units }) => sum + units, 0);
  const totalCourses = Object.values(stats).reduce((sum, { count }) => sum + count, 0);

  // Count non-academic units separately
  const nonAcademicUnits = stats.required_non_academic.units;
  const nonAcademicCount = stats.required_non_academic.count;

  const typeLabels = {
    ge_elective: "GE Electives",
    elective: "Electives",
    major: "Major Courses",
    required_academic: "Required Academic",
    required_non_academic: "Required Non-Academic"
  };

  // Filter out types with no courses
  const activeTypeEntries = Object.entries(stats)
    .filter(([type, { count }]) => type !== 'required_non_academic' && count > 0);
  
  // Calculate total for semester view
  let semTotalCourses = 0;
  let semTotalUnits = 0;
  Object.values(semesterBreakdown).forEach(yearData => {
    Object.values(yearData).forEach(data => {
      semTotalCourses += data.totalCourses;
      semTotalUnits += data.totalUnits;
    });
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h3 className="text-lg font-semibold">Plan Summary</h3>
        <p className="text-sm text-gray-500 mt-1">
          Review your course selections before finalizing your plan.
        </p>
      </div>
      
      {/* Simple button toggle instead of dropdown */}
      <div className="flex justify-end mb-2">
        <Button 
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-gray-500 hover:text-blue-600"
          onClick={() => setViewMode(viewMode === "by-type" ? "by-semester" : "by-type")}
        >
          <ArrowUpDown className="w-4 h-4 mr-1" />
          {viewMode === "by-type" ? "View By Semester" : "View By Course Type"}
        </Button>
      </div>
      
      {/* Summary Table Card - By Course Type */}
      {viewMode === "by-type" && (
        <Card className="p-4 mb-6 border border-gray-200">
          <ScrollArea className="h-[280px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Course Type</TableHead>
                  <TableHead className="text-center w-[100px]">Courses</TableHead>
                  <TableHead className="text-center w-[100px]">Units</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {/* Academic courses - only show types that have courses */}
                {activeTypeEntries.map(([type, { count, units }]) => (
                  <TableRow key={type}>
                    <TableCell className="w-[300px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-4 rounded ${getCourseTypeColor(type)}`} />
                        {typeLabels[type]}
                      </div>
                    </TableCell>
                    <TableCell className="text-center w-[100px]">{count}</TableCell>
                    <TableCell className="text-center w-[100px]">{units}</TableCell>
                  </TableRow>
                ))}
                
                {/* Required Non-Academic row */}
                {nonAcademicCount > 0 && (
                  <TableRow>
                    <TableCell className="w-[300px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-4 rounded ${getCourseTypeColor('required_non_academic')}`} />
                        {typeLabels['required_non_academic']}
                      </div>
                    </TableCell>
                    <TableCell className="text-center w-[100px]">{nonAcademicCount}</TableCell>
                    <TableCell className="text-center w-[100px]">{nonAcademicUnits}</TableCell>
                  </TableRow>
                )}
                
                {/* Total Units (with everything) */}
                <TableRow className="border-t-2 font-medium">
                  <TableCell className="w-[300px] font-bold">Total</TableCell>
                  <TableCell className="text-center w-[100px] font-bold">{totalCourses}</TableCell>
                  <TableCell className="text-center w-[100px] font-bold">{totalUnits}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}
      
      {/* Semester breakdown for a more detailed view */}
      {viewMode === "by-semester" && (
        <Card className="p-4 mb-6 border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead className="text-center">Courses</TableHead>
                <TableHead className="text-center">Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {/* Group semesters by year */}
              {Object.keys(semesterBreakdown).sort().map(year => {
                const yearText = year === "1" ? "1st Year" : year === "2" ? "2nd Year" : year === "3" ? "3rd Year" : `${year}th Year`;
                
                // Sort semesters in proper order: 1st Sem, 2nd Sem, Mid Year
                const semOrder = { "1st Sem": 1, "2nd Sem": 2, "Mid Year": 3 };
                const sortedSems = Object.keys(semesterBreakdown[year]).sort((a, b) => semOrder[a] - semOrder[b]);
                
                return sortedSems.map((sem, idx) => {
                  const data = semesterBreakdown[year][sem];
                  
                  return (
                    <TableRow key={`${year}-${sem}`}>
                      {idx === 0 ? (
                        <TableCell rowSpan={sortedSems.length}>
                          <div className="flex items-center gap-2">
                            <div className={`w-1 h-4 rounded ${year === "1" ? "bg-blue-300" : 
                                                    year === "2" ? "bg-green-300" : 
                                                    year === "3" ? "bg-purple-300" : 
                                                    "bg-orange-300"}`} />
                            {yearText}
                          </div>
                        </TableCell>
                      ) : null}
                      <TableCell>{sem}</TableCell>
                      <TableCell className="text-center">{data.totalCourses}</TableCell>
                      <TableCell className="text-center">{data.totalUnits}</TableCell>
                    </TableRow>
                  );
                });
              })}
              
              {/* Total row */}
              <TableRow className="border-t-2">
                <TableCell colSpan={2} className="font-bold">Total</TableCell>
                <TableCell className="text-center font-bold">{semTotalCourses}</TableCell>
                <TableCell className="text-center font-bold">{semTotalUnits}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* Warnings panel */}
      <Card className="border border-gray-200">
        <div 
          className="flex items-center justify-between p-3 cursor-pointer border-b border-gray-100"
          onClick={() => setWarningsExpanded(!warningsExpanded)}
        >
          <div className="flex items-center gap-2">
            {warnings.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            ) : (
              <Check className="h-4 w-4 text-green-500" />
            )}
            <h3 className="text-sm font-medium">Warnings</h3>
            {warnings.length > 0 && (
              <div className="bg-yellow-100 text-yellow-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                {warnings.length}
              </div>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${warningsExpanded ? 'rotate-180' : 'rotate-0'}`} />
        </div>
        
        {warningsExpanded && (
          <div className="p-3">
            {warnings.length > 0 ? (
              <div className="space-y-2">
                {warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-gray-700">
                    <p className="font-medium">{warning.text}</p>
                    <p className="text-gray-500">{warning.details}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-green-700">No issues detected with your current plan.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SummaryStep; 