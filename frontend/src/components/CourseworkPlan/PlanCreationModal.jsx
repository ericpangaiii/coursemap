import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchCoursesForPlanCreation } from "@/lib/utils";
import { getCourseTypeColor, getCourseTypeTextColor } from "@/lib/utils";

// Step components
import SelectGEElectives from "./Steps/SelectGEElectives";
import SelectElectives from "./Steps/SelectElectives";
import SelectMajors from "./Steps/SelectMajors";
import SelectRequired from "./Steps/SelectRequired";
import FinalizePlan from "./Steps/FinalizePlan";

const PlanCreationModal = ({ open, onOpenChange, isEditing }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectionCounts, setSelectionCounts] = useState({
    ge_electives: { completed: 0, total: 5 },
    electives: { completed: 0, total: 3 },
    majors: { completed: 0, total: 4 },
    required: { completed: 0, total: 6 },
    summary: { completed: 0, total: 0 }
  });
  
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState({
    coursesByType: {},
    requiredCounts: {}
  });
  const [error, setError] = useState(null);
  
  // Track selected courses for each step
  const [selectedCourses, setSelectedCourses] = useState({
    ge_elective: { courses: [], requiredCount: 0 },
    elective: { courses: [], requiredCount: 0 },
    major: { courses: [], requiredCount: 0 },
    required: { courses: [], requiredCount: 0 }
  });
  
  // Steps configuration
  const [availableSteps, setAvailableSteps] = useState([]);

  // Fetch course data when the modal opens
  useEffect(() => {
    const loadCourseData = async () => {
      if (open) {
        try {
          setLoading(true);
          setError(null);
          const data = await fetchCoursesForPlanCreation();
          setCourseData(data);
          
          // Handle special case for required courses
          if (data.coursesByType.required && data.coursesByType.required.length > 0) {
            data.requiredCounts.required = data.coursesByType.required.length;
          }
          
          // Update selection counts with real data
          setSelectionCounts({
            ge_electives: { completed: 0, total: data.requiredCounts.ge_elective || 0 },
            electives: { completed: 0, total: data.requiredCounts.elective || 0 },
            majors: { completed: 0, total: data.requiredCounts.major || 0 },
            required: { completed: 0, total: data.requiredCounts.required || 0 },
            summary: { completed: 0, total: 0 }
          });
          
          // Initialize selected courses required counts
          setSelectedCourses(prev => ({
            ge_elective: { ...prev.ge_elective, requiredCount: data.requiredCounts.ge_elective || 0 },
            elective: { ...prev.elective, requiredCount: data.requiredCounts.elective || 0 },
            major: { ...prev.major, requiredCount: data.requiredCounts.major || 0 },
            required: { ...prev.required, requiredCount: data.requiredCounts.required || 0 }
          }));
          
          // Filter steps with available courses
          filterAvailableSteps(data);
        } catch (err) {
          setError('Failed to load course data. Please try again.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCourseData();
  }, [open]);
  
  // Define all possible steps
  const allSteps = [
    {
      id: "ge_electives",
      title: "GE Electives",
      description: "Choose GE elective courses for your plan.",
      component: SelectGEElectives,
      courseTypeKey: "ge_elective",
      count: selectionCounts.ge_electives,
      color: getCourseTypeColor("ge_elective"),
      textColor: getCourseTypeTextColor("ge_elective")
    },
    {
      id: "electives",
      title: "Electives",
      description: "Choose elective courses for your plan.",
      component: SelectElectives,
      courseTypeKey: "elective",
      count: selectionCounts.electives,
      color: getCourseTypeColor("elective"),
      textColor: getCourseTypeTextColor("elective")
    },
    {
      id: "majors",
      title: "Major Courses",
      description: "Choose major courses for your plan.",
      component: SelectMajors,
      courseTypeKey: "major",
      count: selectionCounts.majors,
      color: getCourseTypeColor("major"),
      textColor: getCourseTypeTextColor("major")
    },
    {
      id: "required-courses",
      title: "Required Courses",
      description: "Assign your required courses to semesters.",
      component: SelectRequired,
      courseTypeKey: "required",
      count: selectionCounts.required,
      color: getCourseTypeColor("required"),
      textColor: getCourseTypeTextColor("required")
    },
    {
      id: "finalize",
      title: "Finalize Plan",
      description: "Review and confirm your plan.",
      component: FinalizePlan,
      count: selectionCounts.summary,
      color: "bg-gray-500",
      textColor: "text-gray-500"
    },
  ];
  
  // Filter available steps based on course data
  const filterAvailableSteps = (data) => {
    const filtered = allSteps.filter(step => {
      // Always include the finalize step
      if (step.id === "finalize") return true;
      
      // For other steps, check if there are courses and required count > 0
      const courses = data.coursesByType[step.courseTypeKey];
      
      // For required courses, the required count is the number of courses
      let requiredCount = data.requiredCounts[step.courseTypeKey];
      if (step.courseTypeKey === 'required' && courses && courses.length > 0) {
        requiredCount = courses.length;
      }
      
      return courses && courses.length > 0 && requiredCount > 0;
    });
    
    setAvailableSteps(filtered);
    
    // Reset current step if we filtered out the current step
    if (currentStep >= filtered.length) {
      setCurrentStep(0);
    }
  };

  // Function to handle step transitions
  const goToStep = (index) => {
    if (index >= 0 && index < availableSteps.length) {
      setCurrentStep(index);
    }
  };

  // Function to handle next step
  const goToNextStep = () => {
    goToStep(currentStep + 1);
  };

  // Function to handle previous step
  const goToPrevStep = () => {
    goToStep(currentStep - 1);
  };

  // Handle step completion tracking and collect selected courses
  const handleSelectionChange = (stepId, count, coursesData = null) => {
    // Update selection count
    setSelectionCounts(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        completed: count
      }
    }));
    
    // Store selected courses if provided
    if (coursesData) {
      // Map step ID to course type key
      let courseTypeKey;
      switch(stepId) {
        case 'ge_electives':
          courseTypeKey = 'ge_elective';
          break;
        case 'electives':
          courseTypeKey = 'elective';
          break;
        case 'majors':
          courseTypeKey = 'major';
          break;
        case 'required-courses':
          courseTypeKey = 'required';
          break;
        default:
          courseTypeKey = stepId;
      }
      
      setSelectedCourses(prev => ({
        ...prev,
        [courseTypeKey]: {
          ...prev[courseTypeKey],
          courses: coursesData
        }
      }));
    }
  };

  // Get the dynamic description for each step
  const getStepDescription = (step) => {
    // Return empty string if step is undefined
    if (!step) return "";
    
    if (!courseData.coursesByType) return step.description || "";
    
    const courses = courseData.coursesByType[step.courseTypeKey];
    const requiredCount = selectionCounts[step.id]?.total || 0;
    
    if (!courses || courses.length === 0) return step.description || "";
    
    switch(step.id) {
      case 'ge_electives':
        return `Choose ${requiredCount} from ${courses.length} available GE elective courses.`;
      case 'electives':
        return `Choose ${requiredCount} from ${courses.length} available elective courses.`;
      case 'majors':
        return `Choose ${requiredCount} from ${courses.length} available major courses.`;
      case 'required-courses':
        return `Assign all ${requiredCount} required courses to semesters.`;
      default:
        return step.description || "";
    }
  };
  
  // Get the actual component for the current step
  const CurrentStepComponent = availableSteps[currentStep]?.component;

  // Create the step props including current courses data
  const getStepProps = (stepId) => {
    // Map step IDs to course type keys
    let courseTypeKey;
    switch(stepId) {
      case 'ge_electives':
        courseTypeKey = 'ge_elective';
        break;
      case 'electives':
        courseTypeKey = 'elective';
        break;
      case 'majors':
        courseTypeKey = 'major';
        break;
      case 'required-courses':
        courseTypeKey = 'required';
        break;
      default:
        courseTypeKey = stepId;
    }
    
    // Get courses for the step
    const courses = courseData.coursesByType[courseTypeKey];
    console.log(`Getting courses for ${stepId}, using courseTypeKey: ${courseTypeKey}`, courses);
    
    if (stepId === 'finalize') {
      // For the summary step, pass all selected courses
      return {
        allSelections: selectedCourses,
        loading
      };
    }
    
    // For required courses, the required count should be the number of courses
    let requiredCountValue = selectionCounts[stepId]?.total || 0;
    if (stepId === 'required-courses' && courses && courses.length > 0) {
      requiredCountValue = courses.length;
      
      // If we're seeing a discrepancy, update the selection counts state
      if (selectionCounts[stepId]?.total !== requiredCountValue) {
        setSelectionCounts(prev => ({
          ...prev,
          [stepId]: {
            ...prev[stepId],
            total: requiredCountValue
          }
        }));
      }
    }
    
    return {
      onSelectionChange: (count, coursesData) => handleSelectionChange(stepId, count, coursesData),
      courses: courses || [],
      requiredCount: requiredCountValue,
      loading
    };
  };

  const handleClose = () => {
    // Reset to first step when closing
    setCurrentStep(0);
    onOpenChange(false);
  };

  // Calculate progress percentage
  const progressPercentage = availableSteps.length > 1 
    ? (currentStep / (availableSteps.length - 1)) * 100 
    : 0;

  const currentStepInfo = availableSteps[currentStep];
  
  // Check if the current step has enough selections to proceed
  const canProceedToNextStep = () => {
    // Temporarily allow proceeding to any step
    return true;
    
    /* Original code - uncomment when testing is complete
    // If we're on the last step (finalize), always allow proceeding
    if (currentStep === availableSteps.length - 1) return true;
    
    // Get the current step ID
    const stepId = currentStepInfo?.id;
    
    // If no step info available, we can't proceed
    if (!stepId) return false;
    
    // Check if we've selected enough courses
    return selectionCounts[stepId]?.completed >= selectionCounts[stepId]?.total;
    */
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 flex-shrink-0">
          <DialogTitle>{isEditing ? "Edit Your Plan" : "Create Your Plan"}</DialogTitle>
          <DialogDescription>
            Plan your coursework by selecting courses for each semester.
          </DialogDescription>
        </DialogHeader>

        {/* Fixed header with progress bar */}
        <div className="px-6 py-4 bg-white z-10 border-b flex-shrink-0">
          {/* Progress bar */}
          <Progress value={progressPercentage} className="mb-4" />
          
          {/* Step labels */}
          <div className="flex justify-between mb-3">
            {availableSteps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex-1 text-center ${index > 0 ? "ml-2" : ""}`}
              >
                <span className={`text-xs font-medium block truncate ${
                  index === currentStep ? "text-blue-600" : "text-gray-500"
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-6 rounded mr-2 ${currentStepInfo?.color || 'bg-gray-500'}`}></div>
              <h3 className="text-lg font-semibold text-gray-900">{currentStepInfo?.title || ""}</h3>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{getStepDescription(currentStepInfo)}</p>
        </div>

        {/* Scrollable content area */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <span className="ml-2">Loading course data...</span>
              </div>
            ) : error ? (
              <div className="text-center p-4 text-red-500">
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-4 py-2 bg-primary text-white rounded-md"
                >
                  Retry
                </button>
              </div>
            ) : (
              CurrentStepComponent ? (
                <CurrentStepComponent {...getStepProps(currentStepInfo.id)} />
              ) : (
                <div className="text-center p-4 text-amber-800">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>No component found for this step. Please try again.</p>
                </div>
              )
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between flex-shrink-0 p-6 border-t">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={goToPrevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <Button
              onClick={currentStep === availableSteps.length - 1 ? handleClose : goToNextStep}
              disabled={currentStep < availableSteps.length - 1 && !canProceedToNextStep()}
              className="flex items-center"
            >
              {currentStep === availableSteps.length - 1 ? (
                "Complete"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanCreationModal; 