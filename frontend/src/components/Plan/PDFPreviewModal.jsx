import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileDown, X } from "lucide-react";
import { useState } from "react";

const PDFPreviewModal = ({ 
  open, 
  onOpenChange, 
  onExport
}) => {
  const [selectedTypes, setSelectedTypes] = useState([]);

  const exportTypes = [
    { id: 'ge_elective', name: 'GE Elective POS', color: 'bg-yellow-500' },
    { id: 'free_elective', name: 'Free Elective POS', color: 'bg-purple-500' },
    { id: 'coursework', name: 'Plan of Coursework', color: 'bg-gray-300' }
  ];

  const handleTypeClick = (typeId) => {
    setSelectedTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[800px] h-[90vh] max-h-[800px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>PDF Preview</DialogTitle>
        </DialogHeader>
        
        {/* Export Type Selection */}
        <div className="px-6 py-2">
          <div className="flex flex-wrap gap-2">
            {exportTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedTypes.includes(type.id) ? "default" : "outline"}
                size="sm"
                className={`flex items-center gap-1.5 ${
                  selectedTypes.includes(type.id)
                    ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white' 
                    : 'dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleTypeClick(type.id)}
              >
                <div className={`w-1 h-3 rounded ${type.color}`} />
                <span className="text-sm">{type.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* PDF Preview */}
        <ScrollArea className="flex-1 px-6">
          <div className="flex justify-center">
            <div className="w-full max-w-[210mm] aspect-[1/1.4142] bg-white dark:bg-[hsl(220,10%,15%)] border border-gray-200 dark:border-[hsl(220,10%,20%)] rounded-lg shadow-sm dark:shadow-[hsl(220,10%,10%)]/20">
              <div className="p-4">
                <div className="text-center text-gray-500">
                  <p className="text-sm">PDF Preview Content</p>
                </div>
              </div>
            </div>
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
            onClick={() => onExport(selectedTypes)}
            className={`flex items-center gap-2 ${
              selectedTypes.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white' 
                : 'bg-gray-100 dark:bg-[hsl(220,10%,15%)] text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            disabled={selectedTypes.length === 0}
          >
            <FileDown className="h-4 w-4" />
            Export as PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewModal; 