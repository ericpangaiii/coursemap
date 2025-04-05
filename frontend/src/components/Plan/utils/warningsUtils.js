// Generate warnings for the entire plan
export const generatePlanWarnings = (planData) => {
  const warnings = [];
  
  // Check for semester overloads and underloads
  Object.entries(planData).forEach(([year, yearData]) => {
    Object.entries(yearData).forEach(([sem, courses]) => {
      const semesterUnits = courses.reduce((total, course) => {
        if (course._isCurriculumCourse || course._isTypePlaceholder) {
          return total;
        }
        return total + (parseInt(course.units) || 0);
      }, 0);
      
      if (semesterUnits > 21) {
        warnings.push({
          type: 'overload',
          message: `Year ${year} ${sem}: Overloaded with ${semesterUnits} units (Maximum: 21 units)`
        });
      }
      
      if (semesterUnits < 12) {
        warnings.push({
          type: 'underload',
          message: `Year ${year} ${sem}: Underloaded with ${semesterUnits} units (Minimum: 12 units)`
        });
      }
    });
  });
  
  // Check for missing required courses
  const requiredCourses = {
    'HIST 1': false,
    'KAS 1': false,
    'HK 12': false,
    'HK 13': false
  };
  
  Object.values(planData).forEach(yearData => {
    Object.values(yearData).forEach(semData => {
      semData.forEach(course => {
        if (course.course_code === 'HIST 1' || course.course_code === 'KAS 1') {
          requiredCourses['HIST 1'] = true;
          requiredCourses['KAS 1'] = true;
        }
        if (course.course_code === 'HK 12' || course.course_code === 'HK 13') {
          requiredCourses['HK 12'] = true;
          requiredCourses['HK 13'] = true;
        }
      });
    });
  });
  
  if (!requiredCourses['HIST 1'] && !requiredCourses['KAS 1']) {
    warnings.push({
      type: 'missing',
      message: 'Missing required course: HIST 1 or KAS 1'
    });
  }
  
  if (!requiredCourses['HK 12'] && !requiredCourses['HK 13']) {
    warnings.push({
      type: 'missing',
      message: 'Missing required course: HK 12 or HK 13'
    });
  }
  
  return warnings;
};

// Get warning icon based on warning type
export const getWarningIcon = (type) => {
  switch (type) {
    case 'overload':
      return '⚠️';
    case 'underload':
      return '⚠️';
    case 'missing':
      return '❌';
    default:
      return 'ℹ️';
  }
};

// Get warning color based on warning type
export const getWarningColor = (type) => {
  switch (type) {
    case 'overload':
      return 'text-red-500';
    case 'underload':
      return 'text-yellow-500';
    case 'missing':
      return 'text-red-500';
    default:
      return 'text-blue-500';
  }
}; 