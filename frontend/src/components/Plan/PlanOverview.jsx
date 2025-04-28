import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import YearGrid from "./YearGrid";

const PlanOverview = ({ semesterGrid, onDeleteCourse, onClearAll }) => {
  const years = [1, 2, 3, 4];

  const handleSemesterClick = (year, semester) => {
    // TODO: Handle semester click
    console.log(`Clicked ${year} Year, ${semester} Semester`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="pt-4 flex justify-between items-center mb-4 pr-4">
        <h2 className="text-lg font-semibold">Plan Overview</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ml-4"
          onClick={onClearAll}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Clear All
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-4 gap-3 pr-4">
          {years.map((year) => (
            <YearGrid 
              key={year}
              year={year}
              onSemesterClick={handleSemesterClick}
              semesterGrid={semesterGrid}
              onDeleteCourse={onDeleteCourse}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlanOverview; 