import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CompactSemesterCard from "./CompactSemesterCard";
import { getOrdinalYear } from "@/lib/utils";

const CompactYearCard = ({ year, semesters, onUpdate }) => {
  // Filter out semesters with no courses
  const nonEmptySemesters = Object.entries(semesters)
    .filter(([, courses]) => courses && courses.length > 0)
    .sort(([semA], [semB]) => parseInt(semA) - parseInt(semB));

  if (nonEmptySemesters.length === 0) {
    return null; // Don't render the year card if there are no courses
  }

  return (
    <Card className="w-full">
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm font-medium text-gray-700">
          {getOrdinalYear(year)}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        {nonEmptySemesters.map(([sem, courses]) => (
          <CompactSemesterCard 
            key={`${year}-${sem}`}
            semester={parseInt(sem)}
            courses={courses}
            year={year}
            onUpdate={onUpdate}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default CompactYearCard; 