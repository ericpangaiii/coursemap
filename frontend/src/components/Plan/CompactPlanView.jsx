import CompactYearCard from "./Compact/CompactYearCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Plus, FileDown } from "lucide-react";
import { useState } from "react";
import PlanCreationModal from "@/components/Plan/PlanCreationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CompactPlanView = ({ organizedCourses }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Check if plan has courses
  const hasCourses = Object.values(organizedCourses).some(
    semesters => Object.values(semesters).some(courses => courses.length > 0)
  );

  return (
    <Card>
      <CardHeader className="bg-slate-50">
        <div className="flex justify-between items-center">
          <CardTitle>Plan of Coursework</CardTitle>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  <FileDown className="h-4 w-4" />
                  Export as PDF
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem>
                  GE Elective POS
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Free Elective POS
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Plan of Coursework
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {!hasCourses ? (
              <Button 
                size="sm" 
                onClick={() => setIsCreateModalOpen(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={() => setIsCreateModalOpen(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Plan
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {Object.keys(organizedCourses).length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(organizedCourses).map(([year, semesters]) => (
              <CompactYearCard 
                key={year}
                year={parseInt(year)}
                semesters={semesters}
              />
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-400 text-center py-4">No courses planned yet</div>
        )}
      </CardContent>
      <PlanCreationModal 
        isOpen={isCreateModalOpen}
        setIsOpen={setIsCreateModalOpen}
      />
    </Card>
  );
};

export default CompactPlanView; 