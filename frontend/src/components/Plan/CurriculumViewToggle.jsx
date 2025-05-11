import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const CurriculumViewToggle = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="curriculum-view"
        checked={isEnabled}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-blue-500"
      />
      <Label htmlFor="curriculum-view" className="text-xs text-gray-500">
        View Curriculum
      </Label>
    </div>
  );
};

export default CurriculumViewToggle; 