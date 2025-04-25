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
import { useState, useEffect } from "react";
import CompactYearCard from "./Compact/CompactYearCard";

const CompactPlanView = ({ organizedCourses, onGradeChange, hideHeader = false, hideExport = false, hideCard = false, onPlanCreated }) => {
  const [localOrganizedCourses, setLocalOrganizedCourses] = useState(organizedCourses);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [planCreationModalOpen, setPlanCreationModalOpen] = useState(false);
  
  // Watch for changes in organizedCourses prop
  useEffect(() => {
    setLocalOrganizedCourses(organizedCourses);
  }, [organizedCourses]);
  
  // Check if plan has courses
  const hasCourses = Object.values(localOrganizedCourses).some(
    semesters => Object.values(semesters).some(courses => courses.length > 0)
  );

  const handleExport = (selectedTypes) => {
    // TODO: Implement PDF export functionality
    console.log('Exporting PDF with types:', selectedTypes);
  };

  const content = (
    <>
      {!hideHeader && (
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Plan of Coursework</CardTitle>
            <div className="flex gap-2">
              {!hideExport && (
                <Button 
                  size="sm" 
                  className={`flex items-center gap-1.5 ${
                    hasCourses 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white text-sm' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => setPdfModalOpen(true)}
                  disabled={!hasCourses}
                >
                  <FileDown className="h-4 w-4" />
                  Export as PDF
                </Button>
              )}
              {!hasCourses && (
                <Button 
                  size="sm" 
                  onClick={() => setPlanCreationModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={`${hideCard ? 'p-0' : 'p-4'}`}>
        {Object.keys(localOrganizedCourses).length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(localOrganizedCourses).map(([year, semesters]) => (
              <CompactYearCard 
                key={year}
                year={parseInt(year)}
                semesters={semesters}
                onGradeChange={onGradeChange}
                hideDetailsButton={hideCard}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 min-h-[300px]">
            <FileText className="h-12 w-12 mb-3" />
            <p className="text-sm font-medium">No courses in plan yet</p>
            <p className="text-sm">Click "Create Plan" to get started</p>
          </div>
        )}
      </CardContent>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        open={pdfModalOpen}
        onOpenChange={setPdfModalOpen}
        onExport={handleExport}
      />

      {/* Plan Creation Modal */}
      <PlanCreationModal
        open={planCreationModalOpen}
        onOpenChange={setPlanCreationModalOpen}
        onPlanCreated={onPlanCreated}
      />
    </>
  );

  if (hideCard) {
    return content;
  }

  return <Card>{content}</Card>;
};

export default CompactPlanView; 