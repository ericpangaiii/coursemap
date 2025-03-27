import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * Merges class names with Tailwind's class conflict resolution
 * @param  {...any} inputs - Class names or conditional objects to merge
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Get initials from a name
 * @param {string} name - Name to get initials from
 * @returns {string} Initials
 */
export function getInitials(name) {
  if (!name) return "?";
  
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Format a date string
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
}

/**
 * ==========================================
 * COURSE TYPE UTILITIES
 * ==========================================
 */

/**
 * Get the normalized course type for use in color determination
 * @param {string} type - The raw course type
 * @returns {string} - Normalized course type
 */
export const getNormalizedCourseType = (type) => {
  if (!type) return "course";
  
  const typeToCheck = type.toLowerCase();
  
  // Handle variations of GE Electives
  if (typeToCheck === "ge_elective" || typeToCheck === "ge elective" || typeToCheck === "geelective") {
    return "ge_elective";
  }
  
  return typeToCheck;
};

/**
 * Get the CSS background color class for a course type
 * @param {string} type - The course type
 * @param {boolean} isAcademic - Whether the course is academic
 * @returns {string} - The CSS background color class
 */
export const getCourseTypeColor = (type, isAcademic = true) => {
  if (!isAcademic) return "bg-gray-200";
  
  const normalizedType = getNormalizedCourseType(type);
  
  switch (normalizedType) {
    case "required":
      return "bg-blue-500";
    case "ge_elective":
      return "bg-yellow-500";
    case "elective":
      return "bg-purple-500";
    case "major":
      return "bg-red-500";
    case "cognate":
      return "bg-indigo-500";
    case "specialized":
      return "bg-teal-500";
    case "track":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

/**
 * Get the CSS text color class for a course type
 * @param {string} type - The course type
 * @returns {string} - The CSS text color class
 */
export const getCourseTypeTextColor = (type) => {
  const normalizedType = getNormalizedCourseType(type);
  
  switch (normalizedType) {
    case "required":
      return "text-blue-500";
    case "ge_elective":
      return "text-yellow-600";
    case "elective":
      return "text-purple-500";
    case "major":
      return "text-red-500";
    case "cognate":
      return "text-indigo-500";
    case "specialized":
      return "text-teal-500";
    case "track":
      return "text-orange-500";
    default:
      return "text-gray-500";
  }
};

/**
 * Get the CSS border color class for a course type
 * @param {string} type - The course type
 * @returns {string} - The CSS border color class
 */
export const getCourseTypeBorderColor = (type) => {
  const normalizedType = getNormalizedCourseType(type);
  
  switch (normalizedType) {
    case "required":
      return "border-blue-500";
    case "ge_elective":
      return "border-yellow-500";
    case "elective":
      return "border-purple-500";
    case "major":
      return "border-red-500";
    case "cognate":
      return "border-indigo-500";
    case "specialized":
      return "border-teal-500";
    case "track":
      return "border-orange-500";
    default:
      return "border-gray-500";
  }
};

/**
 * Get a readable name for the course type
 * @param {string} type - The course type
 * @returns {string} - Human-readable course type name
 */
export const getCourseTypeName = (type) => {
  const normalizedType = getNormalizedCourseType(type);
  
  const names = {
    'major': 'Major Courses',
    'required': 'Required Courses',
    'ge_elective': 'GE Electives',
    'elective': 'Elective Courses',
    'cognate': 'Cognate Courses',
    'specialized': 'Specialized Courses',
    'track': 'Track Courses'
  };
  
  return names[normalizedType] || type;
};

/**
 * ==========================================
 * COURSE SELECTION UTILITIES
 * ==========================================
 */

/**
 * Count the number of completed selections in a selection map
 * @param {Object} selectionsMap - Map of courseId to selection data
 * @returns {number} - Number of completed selections
 */
export const countCompletedSelections = (selectionsMap) => {
  return Object.values(selectionsMap).filter(
    course => course?.selected && course?.year && course?.semester
  ).length;
};

/**
 * Get selected courses data from a selection map
 * @param {Object} selectedCoursesMap - Map of courseId to selection data 
 * @param {Array} courses - Array of course objects
 * @param {boolean} requireYearAndSemester - Whether to require year and semester to be set
 * @returns {Array} - Array of selected course objects
 */
export const getSelectedCoursesData = (selectedCoursesMap, courses, requireYearAndSemester = true) => {
  // Convert the selected courses map to an array of course objects
  const selectedArray = [];
  
  // Go through each course in the selection state
  Object.entries(selectedCoursesMap).forEach(([courseId, selectionData]) => {
    // Check if the course is selected and has year/semester if required
    const isSelected = selectionData?.selected;
    const hasYearAndSemester = selectionData?.year && selectionData?.semester;
    
    if (isSelected && (!requireYearAndSemester || hasYearAndSemester)) {
      // Find the original course data
      const courseData = courses.find(c => c.id === courseId || c.course_id === courseId);
      if (courseData) {
        selectedArray.push({
          ...courseData,
          year: selectionData.year || "",
          semester: selectionData.semester || ""
        });
      }
    }
  });
  
  return selectedArray;
};

/**
 * Check if a course has a valid prescribed schedule
 * @param {Object} course - Course object
 * @returns {boolean} - Whether the course has a valid prescribed schedule
 */
export const hasPrescribedSchedule = (course) => {
  const prescribedYear = course.year !== undefined ? course.year : (course.prescribed_year || null);
  const prescribedSemester = course.sem !== undefined ? course.sem : 
                           (course.semester !== undefined ? course.semester : (course.prescribed_semester || null));
  
  return prescribedYear !== null && prescribedSemester !== null && 
         prescribedYear !== '0' && prescribedYear !== 0 && 
         prescribedSemester !== '0' && prescribedSemester !== 0;
};

/**
 * Get the prescribed year and semester for a course
 * @param {Object} course - Course object
 * @returns {Object} - Object with year and semester properties
 */
export const getPrescribedSchedule = (course) => {
  const prescribedYear = course.year !== undefined ? course.year : (course.prescribed_year || 1);
  const prescribedSemester = course.sem !== undefined ? course.sem : 
                           (course.semester !== undefined ? course.semester : (course.prescribed_semester || 1));
  
  return {
    year: String(prescribedYear),
    semester: String(prescribedSemester)
  };
};

/**
 * Check if a course is partially selected (selected but missing year/sem)
 * @param {Object} courseData - Course data from selection map
 * @returns {boolean} - Whether the course is partially selected
 */
export const isPartiallySelected = (courseData) => {
  return courseData?.selected && (!courseData?.year || !courseData?.semester);
};

// Utility to get a readable semester name
export const getSemesterName = (semester) => {
  const semesterMap = {
    '1': '1st Semester',
    '2': '2nd Semester',
    '3': 'Summer'
  };
  return semesterMap[semester] || `Semester ${semester}`;
};

/**
 * Format semester offered information
 * @param {string} semOffered - Semester offered string (e.g. "1,2")
 * @returns {string} - Formatted semester offered string (e.g. "1st & 2nd Sem")
 */
export const formatSemesterOffered = (semOffered) => {
  if (!semOffered) return "Any Semester";
  
  // Split the string by comma and filter out empty values
  const semesters = semOffered.split(',').filter(Boolean);
  
  // Map semester numbers to names
  const semesterNames = semesters.map(sem => {
    const trimmedSem = sem.trim();
    return trimmedSem === '1' ? '1st' : 
           trimmedSem === '2' ? '2nd' : 
           trimmedSem === '3' ? 'Summer' : trimmedSem;
  });
  
  // Join with proper formatting
  if (semesterNames.length > 1) {
    return `${semesterNames.slice(0, -1).join(', ')} & ${semesterNames[semesterNames.length - 1]} Sem`;
  } else if (semesterNames.length === 1) {
    return `${semesterNames[0]} Sem`;
  } else {
    return "Any Semester";
  }
};

/**
 * ==========================================
 * PLAN CREATION UTILITIES
 * ==========================================
 */

/**
 * Standardize course type format
 * @param {string} courseType - The unstandardized course type
 * @returns {string} - Standardized course type
 */
export const standardizeCourseType = (courseType) => {
  if (!courseType) return "unknown";
  
  // Convert to lowercase
  let type = courseType.toLowerCase();
  
  // Handle GE Elective variants
  if (type === "ge elective" || type === "ge_elective" || type === "geelective" || type === "ge") {
    return "ge_elective";
  }
  
  return type;
};

/**
 * Group courses by their type
 * @param {Array} courses - List of courses to group
 * @returns {Object} - Courses grouped by type
 */
export const groupCoursesByType = (courses) => {
  if (!courses || !Array.isArray(courses)) return {};
  
  return courses.reduce((acc, course) => {
    // Standardize course type
    const type = standardizeCourseType(course.course_type);
    
    // Initialize array for this type if needed
    if (!acc[type]) {
      acc[type] = [];
    }
    
    // Add course to its type group
    acc[type].push({
      id: course.course_id,
      course_id: course.course_id,
      course_code: course.course_code,
      course_type: type,
      title: course.title,
      units: course.units,
      description: course.description,
      sem_offered: course.sem_offered,
      prescribed_year: course.year,
      prescribed_semester: course.sem,
      is_academic: course.is_academic
    });
    
    return acc;
  }, {});
};

/**
 * Filter courses based on a search query
 * @param {Array} courses - List of courses to filter
 * @param {string} query - Search query
 * @returns {Array} - Filtered courses
 */
export const filterCoursesByQuery = (courses, query) => {
  if (!query || !query.trim()) return courses;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return courses.filter(course => 
    (course.course_code && course.course_code.toLowerCase().includes(normalizedQuery)) ||
    (course.title && course.title.toLowerCase().includes(normalizedQuery)) ||
    (course.description && course.description.toLowerCase().includes(normalizedQuery))
  );
};
