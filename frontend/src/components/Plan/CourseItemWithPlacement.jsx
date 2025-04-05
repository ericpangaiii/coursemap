import CourseItem from "@/components/CourseItem";

const CourseItemWithPlacement = ({ course, type, planData }) => {
  // Find where this course is placed in the plan
  let placement = null;
  
  Object.entries(planData).forEach(([year, yearData]) => {
    Object.entries(yearData).forEach(([sem, courses]) => {
      courses.forEach(c => {
        if (course.course_code === "HK 12/13") {
          // For HK 12/13 courses, check if any of its components are in the plan using curriculum_course_id
          const courseComponents = course.combined_courses || [];
          const isComponentInPlan = courseComponents.some(component => {
            // Check if this component's curriculum_course_id matches any course in the plan
            return c.curriculum_course_id === component.curriculum_course_id ||
                   c._selectedComponentId === component.curriculum_course_id;
          });
          if (isComponentInPlan) {
            placement = { year, sem };
          }
        } else if (course.combined_courses) {
          // For other combined courses
          const isComponentInPlan = course.combined_courses.some(component => 
            c.curriculum_course_id === component.curriculum_course_id
          );
          if (isComponentInPlan) {
            placement = { year, sem };
          }
        } else {
          // For regular courses
          if (c.curriculum_course_id === course.curriculum_course_id || 
              c.course_id === course.course_id) {
            placement = { year, sem };
          }
        }
      });
    });
  });

  const getYearText = (year) => {
    switch (year) {
      case "1": return "1st Year";
      case "2": return "2nd Year";
      case "3": return "3rd Year";
      case "4": return "4th Year";
      default: return `${year}th Year`;
    }
  };

  return (
    <div className="relative">
      <CourseItem course={course} type={type} />
      {placement && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
          {getYearText(placement.year)} {placement.sem}
        </div>
      )}
    </div>
  );
};

export default CourseItemWithPlacement; 