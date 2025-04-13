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
  onExport,
  content
}) => {
  const [selectedType, setSelectedType] = useState(null);

  const exportTypes = [
    { id: 'ge_elective', name: 'GE Elective POS', color: 'bg-yellow-500' },
    { id: 'free_elective', name: 'Free Elective POS', color: 'bg-purple-500' },
    { id: 'coursework', name: 'Plan of Coursework', color: 'bg-gray-300' }
  ];

  const handleTypeClick = (typeId) => {
    setSelectedType(selectedType === typeId ? null : typeId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[800px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>PDF Preview</DialogTitle>
          <DialogDescription>
            Select the type of document to export and review the content.
          </DialogDescription>
        </DialogHeader>
        
        {/* Export Type Selection */}
        <div className="flex gap-2 mb-4">
          {exportTypes.map((type) => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-1.5 ${selectedType === type.id ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              onClick={() => handleTypeClick(type.id)}
            >
              <div className={`w-1 h-3 rounded ${type.color}`} />
              <span className="text-sm">{type.name}</span>
            </Button>
          ))}
        </div>

        {/* Preview Content */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="bg-white">
              <div className="border border-gray-200 rounded-lg p-6 min-h-[500px] shadow-sm">
                {content}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={() => onExport(selectedType)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            disabled={!selectedType}
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