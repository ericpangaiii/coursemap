import PlanCreationModal from "@/components/Plan/PlanCreationModal";
import PDFPreviewModal from "@/components/Plan/PDFPreviewModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading";
import { FileDown, FileText, Plus } from "lucide-react";
import { useState } from "react";
import CompactYearCard from "./Compact/CompactYearCard";

const CompactPlanView = ({ organizedCourses, onOrganizedCoursesChange, onGradeChange }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  
  // Check if plan has courses
  const hasCourses = Object.values(organizedCourses).some(
    semesters => Object.values(semesters).some(courses => courses.length > 0)
  );

  const handlePlanButtonClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleExportClick = () => {
    setIsPDFPreviewOpen(true);
  };

  const handleExport = (type) => {
    // TODO: Implement actual PDF export logic
    console.log(`Exporting ${type} as PDF`);
    setIsPDFPreviewOpen(false);
  };

  const getPreviewContent = () => {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-500">
          <p className="text-sm">PDF Preview Content</p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Plan of Coursework</CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm"
              onClick={handleExportClick}
            >
              <FileDown className="h-4 w-4" />
              Export as PDF
            </Button>
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
      <PDFPreviewModal
        open={isPDFPreviewOpen}
        onOpenChange={setIsPDFPreviewOpen}
        onExport={handleExport}
        content={getPreviewContent()}
      />
    </Card>
  );
};

export default CompactPlanView; 