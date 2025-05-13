import { cn } from "@/lib/utils";
import { getCourseTypeTextColor, getCourseTypeBorderColor } from "@/lib/utils";
import { getCurrentTypeCount } from "@/lib/courseCounts";

// Define the order of course types
const courseTypeOrder = {
  'Required Academic': 1,
  'GE Elective': 2,
  'Elective': 3,
  'Major': 4,
  'Required Non-Academic': 5
};

const CurriculumPlaceholder = ({ type, courseCode }) => {
  const textColor = getCourseTypeTextColor(type);
  const borderColor = getCourseTypeBorderColor(type);

  return (
    <div className={cn(
      "w-full px-2 py-1 rounded-md border border-dashed flex items-center gap-1.5",
      textColor,
      borderColor,
      "opacity-40"
    )}>
      <div className={`w-1 h-3 rounded-full ${borderColor}`} />
      <span className="font-medium text-xs">{courseCode || type}</span>
    </div>
  );
};

const CurriculumPlaceholders = ({ courseTypeCounts, showCurriculum, semesterGrid, courses }) => {
  if (!showCurriculum || !courseTypeCounts) return null;

  const { courseTypeSemesters } = courseTypeCounts;
  const placeholders = {};

  // Initialize placeholders for each year and semester
  for (let year = 1; year <= 4; year++) {
    placeholders[year] = {
      1: [], // First semester
      2: [], // Second semester
      3: []  // Summer semester
    };
  }

  // Add placeholders for each course type except 'required'
  Object.entries(courseTypeSemesters).forEach(([type, semesters]) => {
    if (type === 'required') return;

    semesters.forEach(({ year, sem, count }) => {
      const courseType = type === 'ge_elective' ? 'GE Elective' :
                        type === 'elective' ? 'Elective' :
                        type === 'major' ? 'Major' :
                        type === 'cognate' ? 'Cognate' :
                        type === 'specialized' ? 'Specialized' :
                        type === 'track' ? 'Foundation' : '';

      if (courseType) {
        // Get current count of courses of this type in this semester
        const semesterKey = `${year}-${sem}`;
        const currentCount = getCurrentTypeCount(semesterGrid[semesterKey] || [], courseType);
        
        // Calculate remaining placeholders needed
        const remainingCount = Math.max(0, count - currentCount);

        // Create placeholders for remaining slots
        for (let i = 0; i < remainingCount; i++) {
          placeholders[year][sem].push({
            type: courseType,
            key: `${type}-${year}-${sem}-${i}`
          });
        }
      }
    });
  });

  // Add placeholders for required courses
  if (courses) {
    const requiredAcademic = courses.filter(course => course.course_type === 'Required Academic');
    const requiredNonAcademic = courses.filter(course => course.course_type === 'Required Non-Academic');

    // Add placeholders for Required Academic courses
    requiredAcademic.forEach(course => {
      if (course.year && course.sem) {
        const semesterKey = `${course.year}-${course.sem}`;
        const semesterCourses = semesterGrid[semesterKey] || [];
        
        // Check if this specific course is already in the semester
        const isCourseAdded = semesterCourses.some(
          semesterCourse => semesterCourse.course_code === course.course_code
        );
        
        if (!isCourseAdded) {
          placeholders[course.year][course.sem].push({
            type: 'Required Academic',
            courseCode: course.course_code,
            key: `required-academic-${course.course_id}`
          });
        }
      }
    });

    // Add placeholders for Required Non-Academic courses
    requiredNonAcademic.forEach(course => {
      if (course.year && course.sem) {
        const semesterKey = `${course.year}-${course.sem}`;
        const semesterCourses = semesterGrid[semesterKey] || [];
        
        // Check if this specific course is already in the semester
        const isCourseAdded = semesterCourses.some(
          semesterCourse => semesterCourse.course_code === course.course_code
        );
        
        if (!isCourseAdded) {
          placeholders[course.year][course.sem].push({
            type: 'Required Non-Academic',
            courseCode: course.course_code,
            key: `required-non-academic-${course.course_id}`
          });
        }
      }
    });
  }

  // Sort placeholders in each semester by course type
  for (let year = 1; year <= 4; year++) {
    for (let sem = 1; sem <= 3; sem++) {
      placeholders[year][sem].sort((a, b) => {
        const typeA = courseTypeOrder[a.type] || 99;
        const typeB = courseTypeOrder[b.type] || 99;
        return typeA - typeB;
      });
    }
  }

  // Convert sorted placeholders to JSX elements
  const sortedPlaceholders = {};
  for (let year = 1; year <= 4; year++) {
    sortedPlaceholders[year] = {
      1: placeholders[year][1].map(p => (
        <CurriculumPlaceholder 
          key={p.key}
          type={p.type}
          courseCode={p.courseCode}
        />
      )),
      2: placeholders[year][2].map(p => (
        <CurriculumPlaceholder 
          key={p.key}
          type={p.type}
          courseCode={p.courseCode}
        />
      )),
      3: placeholders[year][3].map(p => (
        <CurriculumPlaceholder 
          key={p.key}
          type={p.type}
          courseCode={p.courseCode}
        />
      ))
    };
  }

  return sortedPlaceholders;
};

export default CurriculumPlaceholders; 