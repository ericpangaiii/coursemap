import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

const CourseworkPlanCard = ({ title, description, onEdit, onExport, onDelete }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <div className="flex gap-2">
          <Button onClick={onEdit} className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Create Plan
          </Button>
          <Button variant="outline" onClick={onExport} disabled className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseworkPlanCard; 