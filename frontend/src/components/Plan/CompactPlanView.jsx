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
import { LoadingSpinner } from "@/components/ui/loading";

const CompactPlanView = ({ organizedCourses, onOrganizedCoursesChange, onGradeChange }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Check if plan has courses
  const hasCourses = Object.values(organizedCourses).some(
    semesters => Object.values(semesters).some(courses => courses.length > 0)
  );

  const handlePlanButtonClick = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded bg-yellow-500" />
                  GE Elective POS
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded bg-purple-500" />
                  Free Elective POS
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded bg-gray-300" />
                  Plan of Coursework
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {!hasCourses && (
              <Button 
                size="sm" 
                onClick={handlePlanButtonClick}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
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
                onGradeChange={onGradeChange}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 min-h-[300px]">
            <FileText className="h-12 w-12 mb-3" />
            <p className="text-sm font-medium">No courses planned yet</p>
            <p className="text-sm">Click "Create Plan" to get started</p>
          </div>
        )}
      </CardContent>
      <PlanCreationModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onPlanCreated={(newPlan) => {
          // Reorganize courses after plan update
          const organized = {};
          if (newPlan?.courses) {
            newPlan.courses.forEach(course => {
              const year = course.year;
              const sem = course.sem;
              
              if (!organized[year]) {
                organized[year] = {};
              }
              
              if (!organized[year][sem]) {
                organized[year][sem] = [];
              }
              
              organized[year][sem].push(course);
            });
          }
          // Update the parent component's organizedCourses through the prop
          if (onOrganizedCoursesChange) {
            onOrganizedCoursesChange(organized);
          }
        }}
        isEditMode={hasCourses}
        existingPlan={organizedCourses}
        loadingSpinner={<LoadingSpinner />}
      />
    </Card>
  );
};

export default CompactPlanView; 