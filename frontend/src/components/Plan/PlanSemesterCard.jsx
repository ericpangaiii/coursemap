import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CourseItem from "@/components/CourseItem";
import { getSemesterName } from "@/lib/utils";
import { FileText, Calendar } from "lucide-react";

const PlanSemesterCard = ({ semester, courses }) => {
  return (
    <Card className="w-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{getSemesterName(semester)}</CardTitle>
          {courses.length > 0 && (
            <div className="text-sm">
              {(() => {
                const totals = courses.reduce((acc, course) => {
                  const units = parseInt(course.units) || 0;
                  if (course.is_academic) {
                    acc.academic += units;
                  } else {
                    acc.nonAcademic += units;
                  }
                  return acc;
                }, { academic: 0, nonAcademic: 0 });
                return (
                  <div className="flex items-center gap-1.5">
                    <div className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-medium">
                      {totals.academic}
                    </div>
                    <span className="text-gray-400">/</span>
                    <div className="px-2 py-1 rounded-md bg-gray-50 text-gray-700 font-medium">
                      {totals.nonAcademic}
                    </div>
                    <span className="text-gray-400 text-xs">units</span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        {courses.length > 0 ? (
          <div className="space-y-2 w-full">
            {courses.map(course => (
              <CourseItem key={course.id} course={course} type={course.course_type} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Calendar className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-500">No courses planned</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanSemesterCard; 