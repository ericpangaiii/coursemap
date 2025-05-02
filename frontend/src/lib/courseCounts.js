/**
 * Get the current count of courses of a specific type in a semester
 * @param {Array} courses - Array of courses in the semester
 * @param {string} targetType - The course type to count
 * @returns {number} - Count of courses of the specified type
 */
export const getCurrentTypeCount = (courses, targetType) => {
  if (!targetType) return 0;
  
  return courses.filter(course => {
    const courseType = course.course_type?.toLowerCase().replace(/[\s_]/g, '');
    const typeToMatch = targetType.toLowerCase().replace(/[\s_]/g, '');
    return courseType === typeToMatch;
  }).length;
};

/**
 * Get the prescribed count for a course type in a specific semester
 * @param {Object} courseTypeCounts - The course type counts data
 * @param {string} courseType - The type of course
 * @param {number} year - The year
 * @param {string} semester - The semester
 * @returns {number} - The prescribed count for that semester
 */
export const getPrescribedCount = (courseTypeCounts, courseType, year, semester) => {
  if (!courseTypeCounts?.courseTypeSemesters) return 0;
  
  // For Required Academic and Required Non-Academic, check if this is a prescribed semester
  if (courseType === 'Required Academic' || courseType === 'Required Non-Academic') {
    // For required courses, we want to highlight if this is a prescribed semester
    // Return a higher number to allow multiple courses in the same semester
    return 10; // This allows up to 10 courses in the same prescribed semester
  }
  
  // For other course types, use the courseTypeSemesters data
  const semesterData = courseTypeCounts.courseTypeSemesters[courseType?.toLowerCase().replace(' ', '_')]?.find(
    s => s.year === year.toString() && s.sem === semester
  );
  
  return semesterData?.count || 0;
};

/**
 * Check if a semester is prescribed for a course
 * @param {Object} course - The course object
 * @param {number} year - The year to check
 * @param {string} semester - The semester to check
 * @returns {boolean} - Whether the semester is prescribed
 */
export const isPrescribedSemester = (course, year, semester) => {
  return course?.prescribed_semesters?.some(
    ps => Number(ps.year) === Number(year) && 
    (ps.sem.toString() === semester || (ps.sem === '3' && semester === '3'))
  );
};

/**
 * Check if the target count has been reached for a course type
 * @param {Object} semesterGrid - The semester grid data
 * @param {string} courseType - The type of course
 * @param {Object} courseTypeCounts - The course type counts data
 * @returns {boolean} - Whether the target count has been reached
 */
export const isTargetCountReached = (semesterGrid, courseType, courseTypeCounts) => {
  if (!courseType) return false;

  const currentCount = Object.values(semesterGrid).reduce((total, semesterCourses) => {
    return total + getCurrentTypeCount(semesterCourses, courseType);
  }, 0);

  const isRequiredType = courseType === 'Required Academic' || courseType === 'Required Non-Academic';
  const requiredCount = isRequiredType 
    ? 10 // For required types, we want to allow multiple courses per prescribed semester
    : courseTypeCounts?.totals[courseType?.toLowerCase().replace(' ', '_')] || 0;

  return currentCount >= requiredCount;
}; 