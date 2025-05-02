import { getCourseTypeColor } from "@/lib/utils";
import { useDraggable } from '@dnd-kit/core';
import { Trash2 } from "lucide-react";

const PlanCourse = ({ course, onDelete }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: course?.id || course?.course_id || 'empty',
    data: course
  });

  if (!course) return null;

  const courseCode = course.course_code || "Unknown Code";
  const normalizedType = course.course_type?.toLowerCase() || "course";
  const courseColor = getCourseTypeColor(normalizedType);

  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(course);
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div 
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="flex-1 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all flex items-center gap-1.5 cursor-grab active:cursor-grabbing"
      >
        <div className={`w-1 h-3 rounded-full ${courseColor}`} />
        <span className="font-medium text-xs text-gray-900 dark:text-gray-100">{courseCode}</span>
      </div>
      <button 
        onClick={handleDelete}
        className="ml-1 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        aria-label="Delete course"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default PlanCourse; 