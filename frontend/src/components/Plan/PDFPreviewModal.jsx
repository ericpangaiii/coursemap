import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { plansAPI, programsAPI } from "@/lib/api";
import { planToastFunctions } from "@/lib/toast";
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { ChevronDown, FileDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FreeElectivesTemplate, GEPlanTemplate, PlanOfCourseworkTemplate } from './PDFTemplates';

const PDFPreviewModal = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [program, setProgram] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Fetch program and plan details when modal opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([
        // Fetch program details
        user?.program_id ? programsAPI.getProgramById(user.program_id) : Promise.resolve(null),
        // Fetch plan details
        plansAPI.getCurrentPlan()
      ])
        .then(([programData, planData]) => {
          console.log('Fetched data:', { programData, planData });
          setProgram(programData);
          setPlanData(planData);
        })
        .catch(error => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, user?.program_id]);

  // Filter courses based on selected type
  const filterCoursesByType = (courses) => {
    if (!selectedType || !courses) return [];
    
    return courses.filter(course => {
      switch (selectedType) {
        case 'ge':
          return course.course_type === 'GE Elective';
        case 'elective':
          return course.course_type === 'Elective';
        case 'full':
          return true;
        default:
          return false;
      }
    });
  };

  // Get the appropriate template based on selected type
  const getTemplate = () => {
    console.log('getTemplate called with:', { user, program, planData, selectedType });
    
    if (!user || !program || !planData) {
      console.log('Missing required data:', { 
        hasUser: !!user, 
        hasProgram: !!program, 
        hasPlanData: !!planData 
      });
      return null;
    }

    const courses = filterCoursesByType(planData.courses);
    console.log('Filtered courses:', courses);
    
    switch (selectedType) {
      case 'ge':
        return <GEPlanTemplate user={user} program={program} courses={courses} />;
      case 'elective':
        return <FreeElectivesTemplate user={user} program={program} courses={courses} />;
      default:
        return <PlanOfCourseworkTemplate user={user} program={program} courses={courses} />;
    }
  };

  // Get the display text for the selected type
  const getSelectedTypeText = () => {
    switch (selectedType) {
      case 'ge':
        return 'GE Plan of Study';
      case 'elective':
        return 'Free Electives Plan of Study';
      case 'full':
        return 'Plan of Coursework';
      default:
        return 'Select Template';
    }
  };

  // Handle PDF export
  const handleExport = async () => {
    if (!selectedType) return;

    try {
      setExporting(true);

      const template = getTemplate();
      if (!template) {
        throw new Error('Failed to generate PDF template');
      }

      const blob = await pdf(template).toBlob();
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      
      // Get user initials
      const initials = user?.name
        ? user.name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toLowerCase()
        : '';
      
      // Get program acronym from the program data
      const programAcronym = program?.acronym?.toLowerCase() || '';
      
      const templateName = getSelectedTypeText().toLowerCase().replace(/\s+/g, '-');
      link.download = `${initials}-${programAcronym}-${templateName}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      planToastFunctions.exportSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      planToastFunctions.exportError();
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[800px] h-[90vh] max-h-[800px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>PDF Preview</DialogTitle>
        </DialogHeader>
        
        {/* Export Type Selection */}
        <div className="px-6 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-[250px] justify-between"
              >
                <span className="flex items-center gap-2">
                  {selectedType === 'ge' && <div className="w-1 h-3 rounded bg-yellow-500" />}
                  {selectedType === 'elective' && <div className="w-1 h-3 rounded bg-purple-500" />}
                  {selectedType === 'full' && <div className="w-1 h-3 rounded bg-gray-300" />}
                  {getSelectedTypeText()}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[250px]">
              <DropdownMenuItem onClick={() => setSelectedType('ge')}>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 rounded bg-yellow-500" />
                  <span>GE Plan of Study</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('elective')}>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 rounded bg-purple-500" />
                  <span>Free Electives Plan of Study</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('full')}>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 rounded bg-gray-300" />
                  <span>Plan of Coursework</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* PDF Preview */}
        <ScrollArea className="flex-1 px-6">
          <div className="flex justify-center">
            {loading ? (
              <div className="w-full max-w-[210mm] aspect-[1/1.4142] bg-white dark:bg-[hsl(220,10%,15%)] border border-gray-200 dark:border-[hsl(220,10%,20%)] rounded-lg shadow-sm dark:shadow-[hsl(220,10%,10%)]/20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-blue-500"></div>
              </div>
            ) : selectedType ? (
              <PDFViewer 
                key={selectedType}
                style={{ width: '100%', height: '100%', minHeight: '500px' }}
              >
                {getTemplate()}
              </PDFViewer>
            ) : (
              <div className="w-full max-w-[210mm] aspect-[1/1.4142] bg-white dark:bg-[hsl(220,10%,15%)] border border-gray-200 dark:border-[hsl(220,10%,20%)] rounded-lg shadow-sm dark:shadow-[hsl(220,10%,10%)]/20">
                <div className="p-4">
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Select a template to preview</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 p-6 border-t dark:border-[hsl(220,10%,20%)]">
          <Button
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 dark:border-[hsl(220,10%,20%)] dark:text-gray-300 dark:hover:bg-[hsl(220,10%,25%)]"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={!selectedType || loading || exporting}
            className={`flex items-center gap-2 ${
              selectedType
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white' 
                : 'bg-gray-100 dark:bg-[hsl(220,10%,15%)] text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <FileDown className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export as PDF'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewModal; 