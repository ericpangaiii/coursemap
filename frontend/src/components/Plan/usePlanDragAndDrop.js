import { useState } from 'react';

export const usePlanDragAndDrop = (initialGrid = {}) => {
  const [activeId, setActiveId] = useState(null);
  const [semesterGrid, setSemesterGrid] = useState(initialGrid);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over) {
      const [year, semester] = over.id.split('-');
      const course = active.data.current;
      
      // Find the current semester of the course
      let currentSemester = null;
      Object.entries(semesterGrid).forEach(([key, courses]) => {
        if (courses.some(c => c.course_id === course.course_id)) {
          currentSemester = key;
        }
      });

      // Remove the course from its current semester
      setSemesterGrid(prevGrid => {
        const newGrid = { ...prevGrid };
        
        // If the course is already in a semester, remove it
        if (currentSemester) {
          newGrid[currentSemester] = newGrid[currentSemester].filter(
            c => c.course_id !== course.course_id
          );
        }

        // Add the course to the new semester
        const semesterKey = `${year}-${semester}`;
        
        // Create a new course object with year and semester values
        const courseWithLocation = {
          ...course,
          year: parseInt(year),
          semester: semester
        };
        
        // Always add the course at the beginning of the array
        // This ensures it's placed at the highlighted location
        newGrid[semesterKey] = [courseWithLocation, ...newGrid[semesterKey]];
        
        return newGrid;
      });
      
      console.log(`Moved course ${course.course_code} to Year ${year}, Semester ${semester}`);
    }
    
    setActiveId(null);
  };

  const handleDeleteCourse = (year, semester, course) => {
    setSemesterGrid(prevGrid => {
      const newGrid = { ...prevGrid };
      const semesterKey = `${year}-${semester}`;
      
      // Remove the course from the semester
      newGrid[semesterKey] = newGrid[semesterKey].filter(
        c => c.course_id !== course.course_id
      );
      
      return newGrid;
    });
    
    console.log(`Deleted course ${course.course_code} from Year ${year}, Semester ${semester}`);
  };

  const handleClearAll = () => {
    setSemesterGrid(initialGrid);
    console.log('Cleared all courses from the plan');
  };

  return {
    activeId,
    semesterGrid,
    handleDragStart,
    handleDragEnd,
    handleDeleteCourse,
    handleClearAll
  };
}; 