import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CourseItem from "@/components/CourseItem";

const PlanSemesterCard = ({ semester, courses }) => {
  // Get the semester name
  const getSemesterName = (semesterNum) => {
    switch (parseInt(semesterNum)) {
      case 1: return "First Semester";
      case 2: return "Second Semester";
      case 3: return "Midyear";
      default: return `Semester ${semesterNum}`;
    }
  };

  return (
    <Card className={`border ${courses.length > 0 ? 'border-slate-200' : 'border-slate-100 bg-slate-50'}`}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base">{getSemesterName(semester)}</CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-4">
        {courses.length > 0 ? (
          <div className="space-y-2">
            {courses.map(course => (
              <CourseItem key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-2">No courses planned</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanSemesterCard; 