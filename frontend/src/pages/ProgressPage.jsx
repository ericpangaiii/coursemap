import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import PageHeader from "@/components/PageHeader";
import { curriculumsAPI } from "@/lib/api";
import CourseTypeCard from "@/components/Progress/CourseTypeCard";
import { AlertCircle } from "lucide-react";
import { getCourseTypeName } from "@/lib/utils";

const ProgressPage = () => {
  const [loading, setLoading] = useState(true);
  const [curriculumData, setCurriculumData] = useState(null);
  const [curriculumCourses, setCurriculumCourses] = useState([]);
  const [error, setError] = useState(null);
  
  // Fetch curriculum data on component mount
  useEffect(() => {
    const fetchCurriculumData = async () => {
      setLoading(true);
      try {
        // Get curriculum structure for the current user
        const structureData = await curriculumsAPI.getCurrentCurriculumStructure();
        
        if (!structureData) {
          setError("No curriculum data found. Please select a curriculum first.");
          setLoading(false);
          return;
        }
        
        console.log("Curriculum structure data:", structureData);
        setCurriculumData(structureData);
        
        // Get curriculum courses
        const coursesData = await curriculumsAPI.getCurrentCurriculumCourses();
        console.log("Curriculum courses data:", coursesData);

        // Log is_academic values to debug
        if (coursesData && coursesData.length > 0) {
          console.log("is_academic examples:", coursesData.slice(0, 5).map(c => ({
            course_code: c.course_code,
            course_type: c.course_type,
            is_academic: c.is_academic,
            type_of_is_academic: typeof c.is_academic
          })));
          
          // Count required courses with different is_academic values
          const requiredCourses = coursesData.filter(c => c.course_type?.toLowerCase() === 'required');
          console.log("Required courses count:", requiredCourses.length);
          console.log("Required academic courses:", requiredCourses.filter(c => c.is_academic === true || c.is_academic === 'true').length);
          console.log("Required non-academic courses:", requiredCourses.filter(c => c.is_academic === false || c.is_academic === 'false').length);
        }

        setCurriculumCourses(coursesData);
        
      } catch (err) {
        console.error("Error fetching curriculum data:", err);
        setError("Failed to load curriculum data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurriculumData();
  }, []);
  
  // Group courses by course type
  const coursesByType = curriculumCourses.reduce((acc, course) => {
    // Check if course has course_type property, if not, we may need different handling
    const courseType = course.course_type || "unknown";
    
    // Extract course type, standardize format and handle case sensitivity
    let type = courseType.toLowerCase();
    
    // Handle "GE ELECTIVE" specifically as it might be in different formats
    if (type === "ge elective" || type === "ge_elective" || type === "geelective") {
      type = "ge_elective";
    } else if (type === "ge") {
      type = "ge_elective";
    }
    
    // Track special course pairs for later processing
    // HK 12/13 pairs
    if (course.course_code === "HK 12" || course.course_code === "HK 13") {
      // Create the HK courses array if it doesn't exist yet
      if (!acc.hk_courses) {
        acc.hk_courses = [];
      }
      acc.hk_courses.push(course);
      return acc;
    }
    
    // HIST 1 and KAS 1 pairs
    if (course.course_code === "HIST 1" || course.course_code === "KAS 1") {
      // Create the HIST/KAS courses array if it doesn't exist yet
      if (!acc.histkas_courses) {
        acc.histkas_courses = [];
      }
      acc.histkas_courses.push(course);
      return acc;
    }
    
    // Special handling for required courses - separate academic and non-academic
    if (type === "required") {
      // Check the value and type of is_academic for debugging
      console.log(`Course ${course.course_code} is_academic:`, course.is_academic, typeof course.is_academic);
      
      // Default to true if is_academic is undefined, otherwise use the value
      // Handle different data types (boolean, string) since is_academic might come in different formats
      let isAcademic;
      if (course.is_academic === undefined) {
        isAcademic = true;
      } else if (typeof course.is_academic === 'string') {
        isAcademic = course.is_academic.toLowerCase() === 'true';
      } else {
        isAcademic = Boolean(course.is_academic);
      }
      
      console.log(`Converted isAcademic for ${course.course_code}:`, isAcademic);
      
      const requiredType = isAcademic ? "required_academic" : "required_non_academic";
      
      if (!acc[requiredType]) {
        acc[requiredType] = [];
      }
      
      // Ensure we pass year and semester data to the course object
      const courseWithDetails = {
        ...course,
        prescribed_year: course.year,
        prescribed_semester: course.sem
      };
      
      acc[requiredType].push(courseWithDetails);
      return acc;
    }
    
    if (!acc[type]) {
      acc[type] = [];
    }
    // Ensure we pass year and semester data to the course object
    const courseWithDetails = {
      ...course,
      prescribed_year: course.year,
      prescribed_semester: course.sem
    };
    acc[type].push(courseWithDetails);
    return acc;
  }, {});
  
  // Process HK 12 and HK 13 courses if they exist
  if (coursesByType.hk_courses && coursesByType.hk_courses.length > 0) {
    // Group HK courses by course_type and year/semester
    const groupedHKCourses = {};
    
    coursesByType.hk_courses.forEach(course => {
      const courseType = course.course_type?.toLowerCase() || 'unknown';
      const yearSem = `${course.year || 0}-${course.sem || 0}`;
      
      // Create nested structure: course_type -> year-sem -> courses
      if (!groupedHKCourses[courseType]) {
        groupedHKCourses[courseType] = {};
      }
      
      if (!groupedHKCourses[courseType][yearSem]) {
        groupedHKCourses[courseType][yearSem] = {
          hk12: null,
          hk13: null,
          year: course.year,
          sem: course.sem
        };
      }
      
      // Add the course to the appropriate slot
      if (course.course_code === "HK 12") {
        groupedHKCourses[courseType][yearSem].hk12 = course;
      } else if (course.course_code === "HK 13") {
        groupedHKCourses[courseType][yearSem].hk13 = course;
      }
    });
    
    console.log("Grouped HK courses:", groupedHKCourses);
    
    // For each course type, create combined courses
    Object.entries(groupedHKCourses).forEach(([courseType, yearSemGroups]) => {
      Object.values(yearSemGroups).forEach(group => {
        // Only proceed if we have both HK 12 and HK 13 for this year/semester
        if (group.hk12 && group.hk13) {
          // Create a combined course object for this pair
          const combinedHKCourse = {
            course_id: `hk_combined_${group.hk12.course_id}_${group.hk13.course_id}`,
            course_code: "HK 12/13",
            title: "Physical Education & Health",
            course_type: courseType,
            is_academic: false, // PE courses are non-academic
            units: group.hk12.units || 3,
            prescribed_year: group.year || 1,
            prescribed_semester: group.sem || 1,
            description: "Physical Education & Health (HK 12 or HK 13)",
            combined_courses: [group.hk12, group.hk13]
          };
          
          // Add the combined course to the appropriate type
          const requiredType = courseType === 'required' ? "required_non_academic" : courseType;
          if (!coursesByType[requiredType]) {
            coursesByType[requiredType] = [];
          }
          coursesByType[requiredType].push(combinedHKCourse);
          
          // Remove the individual courses from their original arrays
          const removeFromOriginal = (course) => {
            const type = course.course_type.toLowerCase();
            const requiredTypeToCheck = type === 'required' ? 
                                      (course.is_academic ? "required_academic" : "required_non_academic") : 
                                      type;
            
            if (coursesByType[requiredTypeToCheck]) {
              coursesByType[requiredTypeToCheck] = coursesByType[requiredTypeToCheck].filter(
                c => c.course_id !== course.course_id
              );
            }
          };
          
          // Try to remove from original arrays (if they were added before)
          removeFromOriginal(group.hk12);
          removeFromOriginal(group.hk13);
        } else {
          // If we only have one of the courses, make sure it's in the right array
          const singleCourse = group.hk12 || group.hk13;
          if (singleCourse) {
            const type = singleCourse.course_type.toLowerCase();
            const requiredType = type === 'required' ?
                               (singleCourse.is_academic ? "required_academic" : "required_non_academic") :
                               type;
            
            if (!coursesByType[requiredType]) {
              coursesByType[requiredType] = [];
            }
            
            // Only add if not already present
            const alreadyExists = coursesByType[requiredType].some(c => c.course_id === singleCourse.course_id);
            if (!alreadyExists) {
              coursesByType[requiredType].push({
                ...singleCourse,
                prescribed_year: singleCourse.year,
                prescribed_semester: singleCourse.sem
              });
            }
          }
        }
      });
    });
    
    // Remove the hk_courses key
    delete coursesByType.hk_courses;
  }
  
  // Process HIST 1 and KAS 1 courses if they exist
  if (coursesByType.histkas_courses && coursesByType.histkas_courses.length > 0) {
    // Group HIST/KAS courses by course_type and year/semester
    const groupedHISTKASCourses = {};
    
    coursesByType.histkas_courses.forEach(course => {
      const courseType = course.course_type?.toLowerCase() || 'unknown';
      const yearSem = `${course.year || 0}-${course.sem || 0}`;
      
      // Create nested structure: course_type -> year-sem -> courses
      if (!groupedHISTKASCourses[courseType]) {
        groupedHISTKASCourses[courseType] = {};
      }
      
      if (!groupedHISTKASCourses[courseType][yearSem]) {
        groupedHISTKASCourses[courseType][yearSem] = {
          hist1: null,
          kas1: null,
          year: course.year,
          sem: course.sem
        };
      }
      
      // Add the course to the appropriate slot
      if (course.course_code === "HIST 1") {
        groupedHISTKASCourses[courseType][yearSem].hist1 = course;
      } else if (course.course_code === "KAS 1") {
        groupedHISTKASCourses[courseType][yearSem].kas1 = course;
      }
    });
    
    console.log("Grouped HIST/KAS courses:", groupedHISTKASCourses);
    
    // For each course type, create combined courses
    Object.entries(groupedHISTKASCourses).forEach(([courseType, yearSemGroups]) => {
      Object.values(yearSemGroups).forEach(group => {
        // Only proceed if we have both HIST 1 and KAS 1 for this year/semester
        if (group.hist1 && group.kas1) {
          // Create a combined course object for this pair
          const combinedHISTKASCourse = {
            course_id: `histkas_combined_${group.hist1.course_id}_${group.kas1.course_id}`,
            course_code: "HIST 1/KAS 1",
            title: "Philippine History/Kasaysayan ng Pilipinas",
            course_type: courseType,
            is_academic: true, // Both are academic courses
            units: group.hist1.units || 3,
            prescribed_year: group.year || 1,
            prescribed_semester: group.sem || 1,
            description: "Philippine History (HIST 1) or Kasaysayan ng Pilipinas (KAS 1)",
            combined_courses: [group.hist1, group.kas1]
          };
          
          // Add the combined course to the appropriate type
          // Both HIST 1 and KAS 1 are GE courses, so they should be placed in ge_elective
          const targetType = courseType === 'required' ? 
                           (combinedHISTKASCourse.is_academic ? "required_academic" : "required_non_academic") : 
                           courseType;
                           
          if (!coursesByType[targetType]) {
            coursesByType[targetType] = [];
          }
          coursesByType[targetType].push(combinedHISTKASCourse);
          
          // Remove the individual courses from their original arrays
          const removeFromOriginal = (course) => {
            const type = course.course_type.toLowerCase();
            const typeToCheck = type === 'required' ? 
                              (course.is_academic ? "required_academic" : "required_non_academic") : 
                              type;
            
            if (coursesByType[typeToCheck]) {
              coursesByType[typeToCheck] = coursesByType[typeToCheck].filter(
                c => c.course_id !== course.course_id
              );
            }
          };
          
          // Try to remove from original arrays (if they were added before)
          removeFromOriginal(group.hist1);
          removeFromOriginal(group.kas1);
        } else {
          // If we only have one of the courses, make sure it's in the right array
          const singleCourse = group.hist1 || group.kas1;
          if (singleCourse) {
            const type = singleCourse.course_type.toLowerCase();
            const typeToCheck = type === 'required' ?
                             (singleCourse.is_academic ? "required_academic" : "required_non_academic") :
                             type;
            
            if (!coursesByType[typeToCheck]) {
              coursesByType[typeToCheck] = [];
            }
            
            // Only add if not already present
            const alreadyExists = coursesByType[typeToCheck].some(c => c.course_id === singleCourse.course_id);
            if (!alreadyExists) {
              coursesByType[typeToCheck].push({
                ...singleCourse,
                prescribed_year: singleCourse.year,
                prescribed_semester: singleCourse.sem
              });
            }
          }
        }
      });
    });
    
    // Remove the histkas_courses key
    delete coursesByType.histkas_courses;
  }
  
  // Debug output
  console.log("Courses grouped by type:", coursesByType);
  console.log("Course types found:", Object.keys(coursesByType));
  console.log("Course counts by type:", Object.keys(coursesByType).reduce((acc, type) => {
    acc[type] = coursesByType[type].length;
    return acc;
  }, {}));
  
  // Calculate stats for each course type
  const getStatsForType = (type) => {
    if (!curriculumData || !curriculumData.totals) {
      // If no curriculum data, just return the count of courses
      return { 
        total: (coursesByType[type] || []).length,
        completed: 0,
        percentage: 0,
        available: (coursesByType[type] || []).length
      };
    }
    
    // Get the courses for this type
    const courses = coursesByType[type] || [];
    
    // Handle special cases for required academic and non-academic
    if (type === "required_academic" || type === "required_non_academic") {
      // Use the actual count of courses
      const total = courses.length;
      
      // Placeholder for completed courses (will be implemented later)
      const completed = 0;
      const percentage = 0;
      
      return {
        total,
        completed,
        percentage,
        available: total
      };
    }
    
    // Convert type to the corresponding field names in the totals object
    const countField = `${type}_count`;
    // Use the count from curriculum data, but fall back to actual course count
    const total = curriculumData.totals[countField] || courses.length;
    
    // Placeholder for completed courses (will be implemented later)
    const completed = 0;
    const percentage = 0;
    
    return {
      total,
      completed,
      percentage,
      available: courses.length
    };
  };
  
  // List of course types to display
  const courseTypes = Object.keys(coursesByType).filter(type => {
    // Only show types that have courses
    return coursesByType[type] && coursesByType[type].length > 0;
  });

  // Log which course types we're going to display
  console.log("Course types to display:", courseTypes);

  // Calculate total courses from all displayed types
  const calculateTotalRequired = () => {
    if (courseTypes.length === 0) return 0;
    
    let total = 0;
    courseTypes.forEach(type => {
      const stats = getStatsForType(type);
      total += stats.total;
    });
    return total;
  };

  const totalRequired = calculateTotalRequired();

  // Calculate overall stats
  const completedCourses = 0; // Placeholder
  const remainingCourses = totalRequired - completedCourses;
  const completionPercentage = Math.round((completedCourses / totalRequired) * 100) || 0;

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <PageHeader 
        title="Academic Progress" 
        description="Track your progress towards completing your degree requirements."
      />
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <ReloadIcon className="h-6 w-6 animate-spin mr-2" />
          <p>Loading curriculum data...</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall progress bar */}
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Overall Degree Progress</CardTitle>
                <div className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                  {totalRequired > 0 ? `${completionPercentage}%` : "N/A"}
                </div>
              </div>
              <CardDescription>
                {curriculumData?.curriculum?.name || "Your academic journey"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start space-x-2 p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-100">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">Progress tracking will be available soon! For now, this displays placeholder values.</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Course Completion</span>
                    <span className="text-sm font-medium text-gray-700">
                      {totalRequired > 0 ? `${completedCourses} of ${totalRequired} courses` : "No courses available"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-3 rounded-full bg-blue-600 transition-all duration-1000 ease-in-out"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
                  {totalRequired > 0 ? (
                    <>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="text-3xl font-bold text-blue-600">{completedCourses}</h3>
                        <p className="text-sm text-blue-700 font-medium mt-1">Courses Completed</p>
                      </div>
                      
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <h3 className="text-3xl font-bold text-amber-600">{remainingCourses}</h3>
                        <p className="text-sm text-amber-700 font-medium mt-1">Courses Remaining</p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h3 className="text-3xl font-bold text-green-600">{completionPercentage}%</h3>
                        <p className="text-sm text-green-700 font-medium mt-1">Overall Completion</p>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-full p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                      <p className="text-gray-500">No course requirements found for your curriculum.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course type summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Requirements by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {courseTypes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {/* Course types */}
                  {courseTypes.map(type => {
                    const stats = getStatsForType(type);
                    
                    // For required types, use the utils.js function to get the proper name
                    let typeName;
                    let isAcademic = true; // Default for most types
                    
                    if (type === "required_academic") {
                      typeName = getCourseTypeName("required", true);
                      isAcademic = true;
                    } else if (type === "required_non_academic") {
                      typeName = getCourseTypeName("required", false);
                      isAcademic = false;
                    } else {
                      typeName = getReadableTypeName(type);
                    }
                    
                    // Get the appropriate color for this course type
                    const typeColor = type === "required_academic" ? "required" : 
                                      type === "required_non_academic" ? "required" : type;
                    
                    return (
                      <div key={type} className="border rounded-md p-4">
                        <h3 className="text-sm font-medium text-gray-500">{typeName}</h3>
                        <p className="text-2xl font-bold">{stats.completed}/{stats.total}</p>
                        <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              type === "required_academic" ? "bg-blue-500" : 
                              type === "required_non_academic" ? "bg-blue-300" :
                              type === "major" ? "bg-red-500" :
                              type === "ge_elective" ? "bg-yellow-500" :
                              type === "elective" ? "bg-purple-500" :
                              type === "cognate" ? "bg-indigo-500" :
                              type === "specialized" ? "bg-teal-500" :
                              type === "track" ? "bg-orange-500" :
                              "bg-blue-600"
                            }`} 
                            style={{ width: `${stats.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Total courses */}
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-500">Total Courses</h3>
                    <p className="text-2xl font-bold">{completedCourses}/{totalRequired}</p>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">No course requirements found.</p>
                  <p className="text-sm text-gray-400 mt-2">Please contact your program administrator if you believe this is an error.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Course type cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseTypes.length > 0 ? (
              courseTypes.map(type => (
                <CourseTypeCard
                  key={type}
                  type={type}
                  courses={coursesByType[type] || []}
                  stats={getStatsForType(type)}
                />
              ))
            ) : (
              <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No courses found in your curriculum.</p>
                <p className="text-sm text-gray-400 mt-2">Please contact your program administrator if you believe this is an error.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Helper function to get readable course type names
const getReadableTypeName = (type) => {
  // Standardize type
  let standardType = type.toLowerCase();
  
  // Handle GE Electives
  if (standardType === "ge elective" || standardType === "geelective" || standardType === "ge") {
    standardType = "ge_elective";
  }
  
  // Handle required academic and non-academic
  if (standardType === "required_academic") {
    return getCourseTypeName("required", true);
  }
  
  if (standardType === "required_non_academic") {
    return getCourseTypeName("required", false);
  }
  
  const names = {
    'major': 'Major',
    'required': 'Required',
    'ge_elective': 'GE Elective',
    'elective': 'Elective',
    'cognate': 'Cognate',
    'specialized': 'Specialized',
    'track': 'Track'
  };
  return names[standardType] || type;
};

export default ProgressPage; 