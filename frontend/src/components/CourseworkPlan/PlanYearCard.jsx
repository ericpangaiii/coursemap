import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlanSemesterCard from "@/components/CourseworkPlan/PlanSemesterCard";

const PlanYearCard = ({ year, yearData }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50">
        <CardTitle>Year {year}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(semester => (
            <PlanSemesterCard 
              key={semester} 
              semester={semester}
              courses={yearData[semester] || []}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanYearCard; 