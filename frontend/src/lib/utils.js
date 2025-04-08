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
  if (typeToCheck === "ge_elective" || typeToCheck === "ge elective" || 
      typeToCheck === "geelective" || typeToCheck === "ge elective") {
    return "ge";
  }
  
  if (typeToCheck === "required" || typeToCheck === "required_academic" || 
      typeToCheck === "required academic" || typeToCheck === "required-academic") {
    return "academic";
  }
  
  if (typeToCheck === "required_non_academic" || typeToCheck === "required non academic" || 
      typeToCheck === "required non-academic" || typeToCheck === "required-non-academic" ||
      typeToCheck === "required nonacademic" || typeToCheck === "required_nonacademic") {
    return "non_academic";
  }
  
  if (typeToCheck === "elective") {
    return "elective";
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
 * ==========================================
 * SEMESTER UTILITIES
 * ==========================================
 */

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
 * Calculate total units for a semester
 * @param {Array} semesterCourses - Array of courses in a semester
 * @returns {number} - Total units
 */
export const calculateSemesterUnits = (semesterCourses) => {
  return semesterCourses.reduce((total, course) => {
    // Skip curriculum courses and placeholders when calculating units
    if (course._isCurriculumCourse || course._isTypePlaceholder) {
      return total;
    }
    return total + (parseInt(course.units) || 0);
  }, 0);
};

/**
 * Check if a semester is overloaded
 * @param {number} semesterUnits - Total units in a semester
 * @returns {boolean} - Whether the semester is overloaded
 */
export const isSemesterOverloaded = (semesterUnits) => {
  return semesterUnits > 21; // Maximum allowed units per semester
};

/**
 * Check if a semester is underloaded
 * @param {number} semesterUnits - Total units in a semester
 * @returns {boolean} - Whether the semester is underloaded
 */
export const isSemesterUnderloaded = (semesterUnits) => {
  return semesterUnits < 12; // Minimum required units per semester
};

/**
 * Get semester warnings based on units
 * @param {number} semesterUnits - Total units in a semester
 * @returns {Array} - Array of warning objects
 */
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

/**
 * Get semester status based on units
 * @param {number} semesterUnits - Total units in a semester
 * @returns {string} - Semester status ('overloaded', 'underloaded', or 'normal')
 */
export const getSemesterStatus = (semesterUnits) => {
  if (isSemesterOverloaded(semesterUnits)) {
    return 'overloaded';
  }
  if (isSemesterUnderloaded(semesterUnits)) {
    return 'underloaded';
  }
  return 'normal';
};

/**
 * Get semester status color
 * @param {string} status - Semester status
 * @returns {string} - CSS color class
 */
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

/**
 * ==========================================
 * COURSE ITEM UTILITIES
 * ==========================================
 */

/**
 * Get CSS class for a course item
 * @param {Object} course - Course object
 * @returns {string} - CSS class
 */
export const getCourseItemClass = (course) => {
  if (course._isTypePlaceholder) {
    return 'text-gray-400 italic font-normal';
  }
  return course._isCurriculumCourse ? 'text-gray-400 italic' : 'text-gray-600';
};

/**
 * Get CSS class for a course indicator
 * @param {Object} course - Course object
 * @param {string} colorType - Color type
 * @returns {string} - CSS class
 */
export const getCourseIndicatorClass = (course, colorType) => {
  const baseColor = getCourseTypeColor(colorType);
  if (course._isCurriculumCourse) {
    // Return a more transparent version of the color
    if (baseColor.includes('bg-yellow-500')) return 'bg-yellow-200';
    if (baseColor.includes('bg-blue-500')) return 'bg-blue-200';
    if (baseColor.includes('bg-blue-300')) return 'bg-blue-100';
    if (baseColor.includes('bg-purple-500')) return 'bg-purple-200';
    if (baseColor.includes('bg-red-500')) return 'bg-red-200';
    return 'bg-gray-200';
  }
  return baseColor;
};

/**
 * ==========================================
 * PLAN WARNINGS UTILITIES
 * ==========================================
 */

/**
 * Generate warnings for the entire plan
 * @param {Object} planData - Plan data object
 * @returns {Array} - Array of warning objects
 */
export const generatePlanWarnings = (planData) => {
  const warnings = [];
  
  // Check for semester overloads and underloads
  Object.entries(planData).forEach(([year, yearData]) => {
    Object.entries(yearData).forEach(([sem, courses]) => {
      const semesterUnits = calculateSemesterUnits(courses);
      
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

/**
 * Get warning icon based on warning type
 * @param {string} type - Warning type
 * @returns {string} - Warning icon
 */
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

/**
 * Get warning color based on warning type
 * @param {string} type - Warning type
 * @returns {string} - CSS color class
 */
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

// Define the order of course types
const courseTypeOrder = {
  'REQUIRED_ACADEMIC': 1,
  'REQUIRED_NON_ACADEMIC': 2,
  'GE_ELECTIVE': 3,
  'ELECTIVE': 4,
  'MAJOR': 5
};

export function sortCourses(courses) {
  return [...courses].sort((a, b) => {
    // First sort by course type
    const typeA = courseTypeOrder[a.course_type] || 99;
    const typeB = courseTypeOrder[b.course_type] || 99;
    
    if (typeA !== typeB) {
      return typeA - typeB;
    }
    
    // If same type, sort alphabetically by course code
    return a.course_code.localeCompare(b.course_code);
  });
}

export function getOrdinalYear(year) {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const suffix = year <= 3 ? suffixes[year] : suffixes[0];
  return `${year}${suffix} Year`;
}
