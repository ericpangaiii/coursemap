import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const AssignAllButton = ({ onClick, courses, semesterGrid, onAssignAll }) => {
  const handleAssignAll = () => {
    // Create a new grid object to avoid mutating the original
    const newGrid = { ...semesterGrid };
    
    // Sort courses by year and semester to maintain order
    const sortedCourses = [...courses].sort((a, b) => {
      // First sort by year
      if (a.year !== b.year) {
        return parseInt(a.year) - parseInt(b.year);
      }
      // Then sort by semester (1, 2, 3)
      const semOrder = { '1': 0, '2': 1, '3': 2 };
      return semOrder[a.sem] - semOrder[b.sem];
    });

    // Add each course to its prescribed semester
    sortedCourses.forEach(course => {
      // Skip if course is already in the grid
      const isAlreadyInGrid = Object.values(semesterGrid).some(semesterCourses => 
        semesterCourses.some(c => c.id === course.id)
      );
      
      if (!isAlreadyInGrid) {
        const semesterKey = `${course.year}-${course.sem}`;
        
        // Create a new course object with year and semester values
        const courseWithLocation = {
          ...course,
          year: parseInt(course.year),
          semester: course.sem
        };
        
        // Add the course to the semester
        if (!newGrid[semesterKey]) {
          newGrid[semesterKey] = [];
        }
        newGrid[semesterKey].push(courseWithLocation);
      }
    });

    // Call the parent's onAssignAll with the new grid
    onAssignAll(newGrid);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleAssignAll}
      className="h-7 px-3 flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
    >
      <Calendar className="h-3 w-3" />
      <span className="text-xs">Assign All</span>
    </Button>
  );
};

export default AssignAllButton; 