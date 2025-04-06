import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlanSemesterCard from "@/components/Plan/PlanSemesterCard";

const PlanYearCard = ({ year, yearData }) => {
  const getYearName = (yearNum) => {
    switch (parseInt(yearNum)) {
      case 1: return "1st Year";
      case 2: return "2nd Year";
      case 3: return "3rd Year";
      case 4: return "4th Year";
      case 5: return "5th Year";
      default: return `${yearNum}th Year`;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50 py-3">
        <CardTitle className="text-lg">{getYearName(year)}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map(sem => (
            <PlanSemesterCard 
              key={sem} 
              semester={sem}
              courses={yearData[sem] || []}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanYearCard; 