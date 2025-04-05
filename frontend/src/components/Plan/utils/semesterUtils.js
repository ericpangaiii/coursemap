// Calculate total units for a semester
export const calculateSemesterUnits = (semesterCourses) => {
  return semesterCourses.reduce((total, course) => {
    // Skip curriculum courses and placeholders when calculating units
    if (course._isCurriculumCourse || course._isTypePlaceholder) {
      return total;
    }
    return total + (parseInt(course.units) || 0);
  }, 0);
};

// Check if a semester is overloaded
export const isSemesterOverloaded = (semesterUnits) => {
  return semesterUnits > 21; // Maximum allowed units per semester
};

// Check if a semester is underloaded
export const isSemesterUnderloaded = (semesterUnits) => {
  return semesterUnits < 12; // Minimum required units per semester
};

// Get semester warnings based on units
export const getSemesterWarnings = (semesterUnits) => {
  const warnings = [];
  
  if (isSemesterOverloaded(semesterUnits)) {
    warnings.push({
      type: 'overload',
      message: `Overloaded: ${semesterUnits} units (Maximum: 21 units)`
    });
  }
  
  if (isSemesterUnderloaded(semesterUnits)) {
    warnings.push({
      type: 'underload',
      message: `Underloaded: ${semesterUnits} units (Minimum: 12 units)`
    });
  }
  
  return warnings;
};

// Get semester status based on units
export const getSemesterStatus = (semesterUnits) => {
  if (isSemesterOverloaded(semesterUnits)) {
    return 'overloaded';
  }
  if (isSemesterUnderloaded(semesterUnits)) {
    return 'underloaded';
  }
  return 'normal';
};

// Get semester status color
export const getSemesterStatusColor = (status) => {
  switch (status) {
    case 'overloaded':
      return 'text-red-500';
    case 'underload':
      return 'text-yellow-500';
    default:
      return 'text-green-500';
  }
}; 