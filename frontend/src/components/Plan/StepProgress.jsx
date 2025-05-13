import { cn } from "@/lib/utils";

const StepProgress = ({ currentStep, courseSteps }) => {
  return (
    <div className="w-full pb-4">
      <div className="relative flex items-center justify-between">
        {courseSteps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLast = index === courseSteps.length - 1;
          const isNextToActive = index === currentStep - 1;
          const isSecondToLast = index === courseSteps.length - 2;

          return (
            <div key={step.id} className="relative flex flex-col items-center">
              {/* Step circle */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                  "border-2 relative z-10",
                  isActive && "border-blue-600 dark:border-blue-500 bg-white dark:bg-gray-800 scale-110",
                  isCompleted && "border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500",
                  !isActive && !isCompleted && "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                )}
              >
                {isCompleted ? (
                  <svg 
                    className="w-3 h-3 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                ) : (
                  <span className={cn(
                    "text-xs font-medium",
                    isActive && "text-blue-600 dark:text-blue-500",
                    !isActive && !isCompleted && "text-gray-500 dark:text-gray-400"
                  )}>
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Step label */}
              <span className={cn(
                "mt-1 text-xs font-medium text-center transition-colors duration-300 truncate w-[160px]",
                isActive && "text-blue-600 dark:text-blue-500",
                isCompleted && "text-blue-600 dark:text-blue-500",
                !isActive && !isCompleted && "text-gray-500 dark:text-gray-400"
              )}>
                {step.label}
              </span>

              {/* Connecting line */}
              {!isLast && (
                <div className={cn(
                  "absolute top-[11px] left-[50%] h-[2px] overflow-hidden",
                  isSecondToLast && (
                    courseSteps.length === 6 ? "w-[110%]" :
                    courseSteps.length === 5 ? "w-[140%]" :
                    courseSteps.length === 4 ? "w-[160%]" :
                    "w-[180%]"
                  ),
                  !isSecondToLast && "w-[200%]"
                )}>
                  {/* Background line */}
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
                  
                  {/* Progress line */}
                  <div 
                    className={cn(
                      "absolute inset-0 bg-blue-600 dark:bg-blue-500 transition-all duration-500 ease-in-out origin-left",
                      isCompleted && "scale-x-100",
                      isNextToActive && "scale-x-[var(--progress)]",
                      !isCompleted && !isNextToActive && "scale-x-0"
                    )}
                    style={{
                      '--progress': `${(currentStep - index) * 100}%`
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress; 