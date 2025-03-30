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
  
  // Handle variations of course types
  if (typeToCheck === "ge_elective" || typeToCheck === "ge elective" || typeToCheck === "geelective") {
    return "ge";
  }
  
  if (typeToCheck === "required_academic" || typeToCheck === "required academic") {
    return "academic";
  }
  
  if (typeToCheck === "required_non_academic" || typeToCheck === "required non academic" || typeToCheck === "required non-academic") {
    return "non_academic";
  }
  
  return typeToCheck;
};

/**
 * Get the CSS background color class for a course type
 * @param {string} type - The course type
 * @returns {string} - The CSS background color class
 */
export const getCourseTypeColor = (type) => {
  const normalizedType = getNormalizedCourseType(type);
  
  switch (normalizedType) {
    case "ge":
      return "bg-yellow-500";
    case "elective":
      return "bg-purple-500";
    case "major":
      return "bg-red-500";
    case "academic":
      return "bg-blue-500";
    case "non_academic":
      return "bg-blue-300";
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
    case "ge":
      return "text-yellow-600";
    case "elective":
      return "text-purple-500";
    case "major":
      return "text-red-500";
    case "academic":
      return "text-blue-500";
    case "non_academic":
      return "text-blue-300";
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
    case "ge":
      return "border-yellow-500";
    case "elective":
      return "border-purple-500";
    case "major":
      return "border-red-500";
    case "academic":
      return "border-blue-500";
    case "non_academic":
      return "border-blue-300";
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
    'major': 'Majors',
    'ge': 'GE Electives',
    'elective': 'Electives',
    'academic': 'Required Academic',
    'non_academic': 'Required Non-Academic',
    'cognate': 'Cognates',
    'specialized': 'Specialized',
    'track': 'Tracks',
    'course': 'Courses'
  };
  
  return names[normalizedType] || 'Courses';
};

/**
 * Get the semester name from a semester number
 * @param {string|number} semester - The semester number/code
 * @returns {string} - The semester name
 */
export const getSemesterName = (semester) => {
  if (!semester && semester !== 0) return "";
  
  const semStr = String(semester).toLowerCase();
  
  switch (semStr) {
    case "1":
    case "1s":
      return "1st Semester";
    case "2":
    case "2s":
      return "2nd Semester";
    case "m":
    case "3":
      return "Mid Year";
    default:
      return `Semester ${semester}`;
  }
};

/**
 * Format the semester offered string
 * @param {string} semOffered - The semester offered string (e.g., "1,2,M")
 * @returns {string[]} - Array of formatted semester names
 */
export const formatSemesterOffered = (semOffered) => {
  if (!semOffered) return [];
  
  return semOffered.split(',').map(sem => {
    const trimmedSem = sem.trim().toLowerCase();
    switch (trimmedSem) {
      case "1":
      case "1s":
        return "1st Sem";
      case "2":
      case "2s":
        return "2nd Sem";
      case "m":
        return "Mid Year";
      default:
        return sem.trim();
    }
  });
};

/**
 * ==========================================
 * COURSE SELECTION UTILITIES
 * ==========================================
 */

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
