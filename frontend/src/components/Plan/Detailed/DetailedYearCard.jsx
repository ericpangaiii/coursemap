import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DetailedSemesterCard from "./DetailedSemesterCard";

const DetailedYearCard = ({ year, semesters }) => {
  return (
    <Card className="w-full">
      <CardHeader className="py-3 px-4 bg-slate-50">
        <CardTitle className="text-base font-medium text-gray-700">
          Year {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {Object.entries(semesters).map(([sem, courses]) => (
          <DetailedSemesterCard 
            key={`${year}-${sem}`}
            semester={parseInt(sem)}
            courses={courses}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default DetailedYearCard; 