import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDroppable } from '@dnd-kit/core';
import PlanCourse from "./PlanCourse";

const SemesterButton = ({ year, semester, courses = [], onDeleteCourse }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${year}-${semester.id}`,
    data: {
      year,
      semester: semester.id
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`p-2 rounded-lg border border-gray-200 dark:border-gray-800 transition-all ${
        semester.id === 'M' ? 'min-h-[80px]' : 'min-h-[120px]'
      } ${isOver ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 shadow-md' : ''}`}
    >
      <h3 className="font-medium text-xs text-gray-900 dark:text-gray-100 mb-2">
        {semester.label}
      </h3>
      <div className="space-y-1.5">
        {courses.map((course) => (
          <PlanCourse 
            key={course.course_id} 
            course={course} 
            onDelete={(course) => onDeleteCourse(year, semester.id, course)}
          />
        ))}
      </div>
    </div>
  );
};

const YearGrid = ({ year, semesterGrid, onDeleteCourse }) => {
  const semesters = [
    { id: '1', label: '1st Semester' },
    { id: '2', label: '2nd Semester' },
    { id: 'M', label: 'Mid Year' }
  ];

  const getYearLabel = (year) => {
    switch (year) {
      case 1: return '1st Year';
      case 2: return '2nd Year';
      case 3: return '3rd Year';
      case 4: return '4th Year';
      default: return `${year} Year`;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pt-3 pb-1 px-3">
        <CardTitle className="text-sm">{getYearLabel(year)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3 py-2 pb-4">
        {semesters.map((semester) => (
          <SemesterButton
            key={semester.id}
            year={year}
            semester={semester}
            courses={semesterGrid[`${year}-${semester.id}`] || []}
            onDeleteCourse={onDeleteCourse}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default YearGrid; 