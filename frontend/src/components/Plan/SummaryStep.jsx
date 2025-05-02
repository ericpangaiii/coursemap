import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCourseTypeColor } from "@/lib/utils";
import { getAllWarnings } from "@/lib/warningsTracker";
import { AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { plansAPI } from "@/lib/api";
import { planToastFunctions } from "@/lib/toast";
import toast from "react-hot-toast";

const SummaryStep = ({ semesterGrid, currentStep, onStepChange, courseTypeCounts, curriculumId, onPlanCreated, onOpenChange }) => {
  // Generate course types based on courseTypeCounts
  const courseTypes = useMemo(() => {
    if (!courseTypeCounts) return [];

    const types = [];
    
    // Add GE Electives if count > 0
    if (courseTypeCounts.totals.ge_elective > 0) {
      types.push({ id: 'GE Elective', label: 'GE Elective' });
    }
    
    // Add Free Electives if count > 0
    if (courseTypeCounts.totals.elective > 0) {
      types.push({ id: 'Elective', label: 'Elective' });
    }
    
    // Add Majors if count > 0
    if (courseTypeCounts.totals.major > 0) {
      types.push({ id: 'Major', label: 'Major' });
    }
    
    // Add Required Academic if count > 0
    if (courseTypeCounts.totals.required > 0) {
      types.push({ id: 'Required Academic', label: 'Required Academic' });
    }
    
    // Add Required Non-Academic if count > 0
    if (courseTypeCounts.totals.required > 0) {
      types.push({ id: 'Required Non-Academic', label: 'Required Non-Academic' });
    }
    
    return types;
  }, [courseTypeCounts]);

  // Calculate total courses and units from semesterGrid
  const calculateTotals = () => {
    let totalCourses = 0;
    let totalUnits = 0;
    const typeStats = {};

    // Initialize typeStats with zeros
    courseTypes.forEach(type => {
      typeStats[type.id] = { count: 0, units: 0 };
    });

    // Calculate stats from semesterGrid
    Object.values(semesterGrid).forEach(semesterCourses => {
      semesterCourses.forEach(course => {
        const courseType = course.course_type;
        if (typeStats[courseType]) {
          typeStats[courseType].count++;
          // Convert units to number before adding
          const courseUnits = Number(course.units) || 0;
          typeStats[courseType].units += courseUnits;
          totalCourses++;
          totalUnits += courseUnits;
        }
      });
    });

    return { typeStats, totalCourses, totalUnits };
  };

  const { typeStats, totalCourses, totalUnits } = calculateTotals();
  const warnings = getAllWarnings(semesterGrid);

  // Calculate warning statistics and collect specific course details
  const warningStats = {
    underload: [],
    overload: [],
    missingPrerequisites: [],
    missingCorequisites: []
  };

  Object.entries(warnings).forEach(([yearSem, semesterWarnings]) => {
    const [year, sem] = yearSem.split('-');
    const yearSuffix = year === '1' ? 'st' : year === '2' ? 'nd' : year === '3' ? 'rd' : 'th';
    const semesterName = `${year}${yearSuffix} Year ${sem === '3' ? 'Midyear' : sem === '1' ? '1st Sem' : '2nd Sem'}`;

    if (semesterWarnings.underload) {
      warningStats.underload.push({
        semester: semesterName,
        details: semesterWarnings.underload.details
      });
    }
    if (semesterWarnings.overload) {
      warningStats.overload.push({
        semester: semesterName,
        details: semesterWarnings.overload.details
      });
    }
    
    // Collect prerequisite warnings with course details
    semesterWarnings.missingPrerequisites.forEach(course => {
      const missingReqs = course.requisites.split(',').map(req => req.trim());
      // Group prerequisites by 'and' to show alternative options
      const prerequisiteGroups = missingReqs.reduce((groups, req) => {
        if (req.toLowerCase().includes(' and ')) {
          groups.push(req);
        } else {
          // If it's a single prerequisite, add it as its own group
          groups.push(req);
        }
        return groups;
      }, []);

      warningStats.missingPrerequisites.push({
        courseCode: course.course_code,
        requisites: prerequisiteGroups,
        semester: semesterName
      });
    });

    // Collect corequisite warnings with course details
    semesterWarnings.missingCorequisites.forEach(course => {
      const missingReqs = course.requisites.split(',').map(req => req.trim());
      warningStats.missingCorequisites.push({
        courseCode: course.course_code,
        requisites: missingReqs,
        semester: semesterName
      });
    });
  });

  const hasWarnings = Object.values(warningStats).some(count => 
    Array.isArray(count) ? count.length > 0 : count > 0
  );

  const handleCreatePlan = async () => {
    console.log('Starting plan creation process...');
    console.log('Current semester grid:', semesterGrid);
    console.log('Curriculum ID:', curriculumId);

    if (!curriculumId) {
      console.error('No curriculum ID provided');
      planToastFunctions.createError();
      return;
    }

    try {
      // Show loading toast
      const loadingToast = planToastFunctions.createLoading();
      
      // Get existing plan
      console.log('Getting existing plan...');
      const existingPlan = await plansAPI.getCurrentPlan();
      console.log('Existing plan:', existingPlan);

      if (!existingPlan) {
        console.error('No existing plan found');
        throw new Error('No existing plan found');
      }

      // Add each course to the plan
      for (const [semesterKey, courses] of Object.entries(semesterGrid)) {
        const [year, semester] = semesterKey.split('-');
        
        for (const course of courses) {
          console.log('Adding course:', course);
          try {
            await plansAPI.addCourseToPlan(
              existingPlan.id,
              course.course_id,
              parseInt(year),
              semester,
              'pending'
            );
          } catch (error) {
            console.error(`Error adding course ${course.course_id} to plan:`, error);
            // Continue with other courses even if one fails
          }
        }
      }

      console.log('Plan update completed successfully');
      
      // Dismiss loading toast and show success toast
      toast.dismiss(loadingToast);
      planToastFunctions.createSuccess();
      
      // Close the modal and refresh the plan display
      onOpenChange(false);
      if (typeof onPlanCreated === 'function') {
        console.log('Calling onPlanCreated callback...');
        onPlanCreated(existingPlan);
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      // Show error toast
      planToastFunctions.createError();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-4 mb-4">
          <h2 className="text-lg font-semibold">Plan Summary</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full mr-4">
            <div className="space-y-4 pl-4 pb-4">
              <Card className="mx-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Course Type Statistics
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Course Type</TableHead>
                        <TableHead className="text-center text-xs">Courses</TableHead>
                        <TableHead className="text-center text-xs">Units</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courseTypes.map(({ id, label }) => (
                        <TableRow key={id}>
                          <TableCell className="font-medium text-xs">
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-1 h-4 rounded-sm ${getCourseTypeColor(id)}`}
                              />
                              {label}
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs">{typeStats[id]?.count || 0}</TableCell>
                          <TableCell className="text-center text-xs">{typeStats[id]?.units || 0}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold">
                        <TableCell className="text-xs">Total</TableCell>
                        <TableCell className="text-center text-xs">{totalCourses}</TableCell>
                        <TableCell className="text-center text-xs">{totalUnits}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="mx-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Warnings
                    </CardTitle>
                    <div className={`${hasWarnings ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'} rounded-md w-5 h-5 flex items-center justify-center text-xs font-medium`}>
                      {warningStats.underload.length + warningStats.overload.length + warningStats.missingPrerequisites.length + warningStats.missingCorequisites.length}
                    </div>
                  </div>
                </CardHeader>
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
                        {warningStats.underload.length > 0 && warningStats.underload.map(({ semester, details }, idx) => (
                          <TableRow key={`underload-${idx}`}>
                            <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300 w-1/2">Underload</TableCell>
                            <TableCell className="text-xs text-gray-500 dark:text-gray-400 text-center w-1/2">{semester} has {details}</TableCell>
                          </TableRow>
                        ))}
                        {warningStats.overload.length > 0 && warningStats.overload.map(({ semester, details }, idx) => (
                          <TableRow key={`overload-${idx}`}>
                            <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300 w-1/2">Overload</TableCell>
                            <TableCell className="text-xs text-gray-500 dark:text-gray-400 text-center w-1/2">{semester} has {details}</TableCell>
                          </TableRow>
                        ))}
                        {warningStats.missingPrerequisites.length > 0 && warningStats.missingPrerequisites.map(({ courseCode, requisites, semester }, idx) => (
                          <TableRow key={`prereq-${idx}`}>
                            <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300 w-1/2">
                              Missing {requisites.length === 1 ? 'Prerequisite' : 'Prerequisites'}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 dark:text-gray-400 text-center w-1/2">
                              {courseCode} ({semester}) needs {requisites.length > 1 ? 'either ' : ''}{requisites.join(' or ')}
                            </TableCell>
                          </TableRow>
                        ))}
                        {warningStats.missingCorequisites.length > 0 && warningStats.missingCorequisites.map(({ courseCode, requisites, semester }, idx) => (
                          <TableRow key={`coreq-${idx}`}>
                            <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300 w-1/2">
                              Missing {requisites.length === 1 ? 'Corequisite' : 'Corequisites'}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 dark:text-gray-400 text-center w-1/2">
                              {courseCode} ({semester}) needs {requisites.join(' or ')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No issues detected in the plan.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </Card>

      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          onClick={() => onStepChange(currentStep - 1)}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleCreatePlan}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Plan
        </Button>
      </div>
    </div>
  );
};

export default SummaryStep; 