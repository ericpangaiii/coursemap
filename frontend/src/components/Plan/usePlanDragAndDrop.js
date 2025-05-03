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
        if (courses.some(c => c.id === course.id)) {
          currentSemester = key;
        }
      });

      // Remove the course from its current semester
      setSemesterGrid(prevGrid => {
        const newGrid = { ...prevGrid };
        
        // If the course is already in a semester, remove it
        if (currentSemester) {
          newGrid[currentSemester] = newGrid[currentSemester].filter(
            c => c.id !== course.id
          );
        }

        // Add the course to the new semester
        const semesterKey = `${year}-${semester}`;
        
        // Create a new course object with year and semester values
        const courseWithLocation = {
          ...course,
          year: parseInt(year),
          semester: semester,
          course_id: course.course_id, // Ensure we use the original course_id
          id: course.course_id // Set id to match course_id for consistency
        };
        
        // Initialize the semester array if it doesn't exist
        if (!newGrid[semesterKey]) {
          newGrid[semesterKey] = [];
        }
        
        // Always add the course at the beginning of the array
        // This ensures it's placed at the highlighted location
        newGrid[semesterKey] = [courseWithLocation, ...(newGrid[semesterKey] || [])];
        
        return newGrid;
      });
      
      // Get descriptive labels for year and semester
      const getYearLabel = (year) => {
        switch (year) {
          case '1': return '1st Year';
          case '2': return '2nd Year';
          case '3': return '3rd Year';
          case '4': return '4th Year';
          default: return `${year} Year`;
        }
      };

      const getSemesterLabel = (semester) => {
        switch (semester) {
          case '1': return '1st Sem';
          case '2': return '2nd Sem';
          case 'M':
          case '3': return 'Mid Year';
          default: return semester;
        }
      };

      console.log(`Moved course ${course.course_code} to ${getYearLabel(year)}, ${getSemesterLabel(semester)}`);
    }
    
    setActiveId(null);
  };

  const handleDeleteCourse = (year, semester, course) => {
    setSemesterGrid(prevGrid => {
      const newGrid = { ...prevGrid };
      const semesterKey = `${year}-${semester}`;
      
      // Remove the course from the semester
      newGrid[semesterKey] = newGrid[semesterKey].filter(
        c => c.id !== course.id
      );
      
      return newGrid;
    });
    
    // Get descriptive labels for year and semester
    const getYearLabel = (year) => {
      switch (year) {
        case '1': return '1st Year';
        case '2': return '2nd Year';
        case '3': return '3rd Year';
        case '4': return '4th Year';
        default: return `${year} Year`;
      }
    };

    const getSemesterLabel = (semester) => {
      switch (semester) {
        case '1': return '1st Sem';
        case '2': return '2nd Sem';
        case 'M':
        case '3': return 'Mid Year';
        default: return semester;
      }
    };
    
    console.log(`Deleted course ${course.course_code} from ${getYearLabel(year)}, ${getSemesterLabel(semester)}`);
  };

  const handleClearAll = () => {
    setSemesterGrid(initialGrid);
    console.log('Cleared all courses from the plan');
  };

  return {
    activeId,
    semesterGrid,
    setSemesterGrid,
    handleDragStart,
    handleDragEnd,
    handleDeleteCourse,
    handleClearAll
  };
}; 