import { useState } from "react";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Step components
import SelectGEElectives from "./PlanCreationSteps/SelectGEElectives";
import SelectElectives from "./PlanCreationSteps/SelectElectives";
import SelectMajors from "./PlanCreationSteps/SelectMajors";
import AssignRequiredCourses from "./PlanCreationSteps/AssignRequiredCourses";
import PlanSummary from "./PlanCreationSteps/PlanSummary";

const PlanCreationModal = ({ open, onOpenChange, isEditing }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectionCounts, setSelectionCounts] = useState({
    ge_electives: { completed: 0, total: 5 },
    electives: { completed: 0, total: 3 },
    majors: { completed: 0, total: 4 },
    required: { completed: 6, total: 6 },
    summary: { completed: 0, total: 0 }
  });
  
  // Steps in the plan creation process
  const steps = [
    {
      id: "ge-electives",
      title: "GE Electives",
      description: "You are required to take at least 5 GE elective courses.",
      component: SelectGEElectives,
      count: selectionCounts.ge_electives
    },
    {
      id: "electives",
      title: "Electives",
      description: "You are required to take at least 3 program elective courses.",
      component: SelectElectives,
      count: selectionCounts.electives
    },
    {
      id: "majors",
      title: "Major Courses",
      description: "You are required to take at least 4 major specialization courses.",
      component: SelectMajors,
      count: selectionCounts.majors
    },
    {
      id: "required",
      title: "Required Courses",
      description: "Required courses have been automatically assigned based on your curriculum.",
      component: AssignRequiredCourses,
      count: selectionCounts.required
    },
    {
      id: "summary",
      title: "Plan Summary",
      description: "Review and confirm your plan.",
      component: PlanSummary,
      count: selectionCounts.summary
    },
  ];

  const handleSelectionChange = (stepId, completed) => {
    setSelectionCounts(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        completed
      }
    }));
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // Reset to first step when closing
    setCurrentStep(0);
    onOpenChange(false);
  };

  // Calculate progress percentage
  const progressPercentage = (currentStep / (steps.length - 1)) * 100;

  const CurrentStepComponent = steps[currentStep].component;
  const currentStepInfo = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-6 border-b">
          <DialogTitle>{isEditing ? "Edit Your Plan" : "Create Your Plan"}</DialogTitle>
          <DialogDescription>
            Plan your coursework by selecting courses for each semester.
          </DialogDescription>
        </DialogHeader>

        {/* Fixed header with progress bar */}
        <div className="px-6 py-4 bg-white z-10 border-b">
          {/* Progress bar */}
          <Progress value={progressPercentage} className="mb-4" />
          
          {/* Step labels */}
          <div className="flex justify-between mb-3">
            {steps.map((step, index) => (
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
              <div className={`w-2 h-6 rounded mr-2 ${getTypeColor(currentStep)}`}></div>
              <h3 className="text-lg font-semibold">{currentStepInfo.title}</h3>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{currentStepInfo.description}</p>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-6 py-4">
              <CurrentStepComponent onSelectionChange={(completed) => handleSelectionChange(currentStepInfo.id, completed)} />
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex justify-between flex-shrink-0 p-6 border-t">
          <Button 
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <Button
            onClick={currentStep === steps.length - 1 ? handleClose : goToNextStep}
            className="flex items-center"
          >
            {currentStep === steps.length - 1 ? (
              "Complete"
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Function to get color based on step
const getTypeColor = (stepIndex) => {
  const colors = [
    'bg-yellow-500', // GE Electives
    'bg-purple-500', // Electives
    'bg-red-500',    // Major Courses
    'bg-green-500',  // Required Courses
    'bg-blue-500',   // Summary
  ];
  
  return colors[stepIndex] || 'bg-blue-500';
};

export default PlanCreationModal; 