/**
 * Check if a semester is underloaded (less than minimum units)
 * @param {Array} courses - Array of courses in the semester
 * @param {string} semester - The semester identifier ('1', '2', or 'M')
 * @returns {Object} - Object containing whether semester is underloaded and details
 */
export const isUnderloaded = (courses, semester) => {
  // Don't show warnings for empty semesters
  if (!courses || courses.length === 0) {
    return { isUnderloaded: false };
  }

  const totalUnits = courses
    .filter(course => course.is_academic !== false) // Only count academic courses
    .reduce((sum, course) => sum + (parseFloat(course.units) || 0), 0);
  
  // Midyear semester has no minimum unit requirement
  if (semester === '3') {
    return { isUnderloaded: false };
  }
  
  // Regular semesters should have at least 15 units
  return {
    isUnderloaded: totalUnits < 15,
    details: totalUnits < 15 ? `${totalUnits} units` : null
  };
};

/**
 * Check if a semester is overloaded (more than maximum units)
 * @param {Array} courses - Array of courses in the semester
 * @param {string} semester - The semester identifier ('1', '2', or 'M')
 * @returns {Object} - Object containing whether semester is overloaded and details
 */
export const isOverloaded = (courses, semester) => {
  // Don't show warnings for empty semesters
  if (!courses || courses.length === 0) {
    return { isOverloaded: false };
  }

  const totalUnits = courses
    .filter(course => course.is_academic !== false) // Only count academic courses
    .reduce((sum, course) => sum + (parseFloat(course.units) || 0), 0);
  
  // Midyear semester has a maximum of 6 units
  if (semester === 'M') {
    return {
      isOverloaded: totalUnits > 6,
      details: totalUnits > 6 ? `${totalUnits} units` : null
    };
  }
  
  // Regular semesters have a maximum of 19 units
  return {
    isOverloaded: totalUnits > 19,
    details: totalUnits > 19 ? `${totalUnits} units` : null
  };
};

/**
 * Check if a course's prerequisites are satisfied
 * @param {Object} course - The course to check
 * @param {Object} semesterGrid - The entire semester grid data
 * @param {number} currentYear - The current year
 * @param {string} currentSem - The current semester
 * @returns {boolean} - Whether prerequisites are satisfied
 */
export const hasMissingPrerequisites = (course, semesterGrid, currentYear, currentSem) => {
  if (!course.requisites || course.requisites === 'None' || !course.requisite_types?.includes('Prerequisite')) {
    return false;
  }

  // Convert current semester to number for comparison
  const currentSemNum = currentSem === '3' ? 3 : parseInt(currentSem);
  
  // Get prerequisite course IDs
  const prereqIds = course.requisite_course_ids?.split(',').map(id => id.trim()) || [];
  if (prereqIds.length === 0) return false;

  // For OR prerequisites, we need at least one to be satisfied
  // Check if ALL prerequisites are missing or in a later semester
  return prereqIds.every(prereqId => {
    let found = false;
    let foundInLaterSem = false;

    Object.entries(semesterGrid).forEach(([yearSem, courses]) => {
      const [year, sem] = yearSem.split('-');
      const semNum = sem === '3' ? 3 : parseInt(sem);
      
      // Check if prerequisite is in this semester
      const hasPrereq = courses.some(c => c.course_id === prereqId);
      
      if (hasPrereq) {
        found = true;
        // Check if it's in a later semester than the current course
        if (parseInt(year) > currentYear || 
            (parseInt(year) === currentYear && semNum > currentSemNum)) {
          foundInLaterSem = true;
        }
      }
    });

    // Return true if prerequisite is missing or in a later semester
    return !found || foundInLaterSem;
  });
};

/**
 * Check if a course's corequisites are satisfied
 * @param {Object} course - The course to check
 * @param {Object} semesterGrid - The entire semester grid data
 * @param {number} currentYear - The current year
 * @param {string} currentSem - The current semester
 * @returns {boolean} - Whether corequisites are satisfied
 */
export const hasMissingCorequisites = (course, semesterGrid, currentYear, currentSem) => {
  if (!course.requisites || course.requisites === 'None' || !course.requisite_types?.includes('Corequisite')) {
    return false;
  }

  const currentSemKey = `${currentYear}-${currentSem}`;
  const currentSemCourses = semesterGrid[currentSemKey] || [];

  // Get corequisite course IDs
  const coreqIds = course.requisite_course_ids?.split(',').map(id => id.trim()) || [];
  if (coreqIds.length === 0) return false;

  // Check each corequisite
  return coreqIds.some(coreqId => {
    // Corequisite must be in the same semester
    return !currentSemCourses.some(c => c.course_id === coreqId);
  });
};

/**
 * Get all warnings for a specific semester
 * @param {Array} courses - Array of courses in the semester
 * @param {string} semester - The semester identifier ('1', '2', or 'M')
 * @param {number} year - The year
 * @param {Object} semesterGrid - The entire semester grid data
 * @returns {Object} - Object containing warning flags and details
 */
export const getSemesterWarnings = (courses, semester, year, semesterGrid) => {
  const underloadCheck = isUnderloaded(courses, semester);
  const overloadCheck = isOverloaded(courses, semester);
  
  const warnings = {
    underload: underloadCheck.isUnderloaded ? {
      type: 'underload',
      details: underloadCheck.details
    } : null,
    overload: overloadCheck.isOverloaded ? {
      type: 'overload',
      details: overloadCheck.details
    } : null,
    missingPrerequisites: [],
    missingCorequisites: []
  };

  // Check each course for prerequisite and corequisite issues
  courses.forEach(course => {
    if (hasMissingPrerequisites(course, semesterGrid, year, semester)) {
      warnings.missingPrerequisites.push(course);
    }
    if (hasMissingCorequisites(course, semesterGrid, year, semester)) {
      warnings.missingCorequisites.push(course);
    }
  });

  return warnings;
};

/**
 * Get all warnings for the entire plan
 * @param {Object} semesterGrid - The entire semester grid data
 * @returns {Object} - Object containing warnings for each semester
 */
export const getAllWarnings = (semesterGrid) => {
  const allWarnings = {};

  Object.entries(semesterGrid).forEach(([yearSem, courses]) => {
    const [year, semester] = yearSem.split('-');
    allWarnings[yearSem] = getSemesterWarnings(courses, semester, parseInt(year), semesterGrid);
  });

  return allWarnings;
}; 