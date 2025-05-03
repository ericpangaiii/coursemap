import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CompactSemesterCard from "./CompactSemesterCard";
import { getOrdinalYear } from "@/lib/utils";

const CompactYearCard = ({ year, semesters, onGradeChange, hideDetailsButton = false }) => {
  // Sort semesters by number
  const sortedSemesters = Object.entries(semesters)
    .sort(([semA], [semB]) => parseInt(semA) - parseInt(semB));

  return (
    <Card className="w-full">
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {getOrdinalYear(year)}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        {sortedSemesters.map(([sem, courses]) => (
          <CompactSemesterCard 
            key={`${year}-${sem}`}
            semester={parseInt(sem)}
            courses={courses}
            year={year}
            onGradeChange={onGradeChange}
            hideDetailsButton={hideDetailsButton}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default CompactYearCard; 