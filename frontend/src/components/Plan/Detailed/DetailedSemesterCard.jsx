import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSemesterName } from "@/lib/utils";
import CourseItem from "@/components/CourseItem";
import { Calendar } from "lucide-react";

const DetailedSemesterCard = ({ semester, courses }) => {
  return (
    <Card className="w-full">
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-sm font-medium text-gray-600">
          {getSemesterName(semester)}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {courses.length > 0 ? (
          <div className="space-y-2">
            {courses.map((course) => (
              <CourseItem 
                key={course.course_id}
                course={course}
                type={course.course_type}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <Calendar className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-500">No courses planned</p>
            <p className="text-sm text-gray-500">Add courses to this semester</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailedSemesterCard; 