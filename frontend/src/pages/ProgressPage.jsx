import PageHeader from "@/components/PageHeader";
import CourseTypeCard from "@/components/Progress/CourseTypeCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { curriculumsAPI } from "@/lib/api";
import { getCourseTypeName } from "@/lib/utils";
import { useEffect, useState } from "react";

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
        
        setCurriculumData(structureData);
        
        // Get curriculum courses
        const coursesData = await curriculumsAPI.getCurrentCurriculumCourses();
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
  
  // Function to get prescribed semesters for each course type from curriculum structure
  const getPrescribedSemestersForType = (type) => {
    if (!curriculumData || !curriculumData.structures || curriculumData.structures.length === 0) {
      return [];
    }
    
    // Get relevant field from structure based on course type
    const typeCountField = `${type}_count`;
    
    try {
      // Filter structures where this type has courses (count > 0)
      const relevantStructures = curriculumData.structures.filter(structure => {
        // Convert to string then parse as int to handle various data types
        const countStr = String(structure[typeCountField] || '0');
        const count = parseInt(countStr, 10);
        return count > 0;
      });
      
      if (relevantStructures.length === 0) {
        return [];
      }
      
      // Map to year/semester format objects
      return relevantStructures.map(structure => ({
        year: structure.year,
        sem: structure.sem,
        count: parseInt(String(structure[typeCountField] || '0'), 10)
      }));
    } catch (error) {
      console.error(`Error processing structure data for ${type}:`, error);
      return [];
    }
  };
  
  // Group courses by type
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
    
    // Get the prescribed semesters for this type based on curriculum structure
    const prescribedSemesters = getPrescribedSemestersForType(type);
    
    return {
      total,
      completed,
      percentage,
      available: courses.length,
      prescribedSemesters
    };
  };
  
  // After calculating stats, update prescribed_year and prescribed_semester 
  // for GE electives and electives based on curriculum structure
  Object.keys(coursesByType).forEach(type => {
    // For GE electives and electives, get the prescribed semesters from curriculum structure
    if (type === 'ge_elective' || type === 'elective' || type === 'major') {
      // Get semester information from the curriculum structure
      const semestersInfo = getPrescribedSemestersForType(type);
      
      if (semestersInfo.length > 0) {
        // Format semester information for display
        const formattedSemesters = semestersInfo.map(sem => {
          const year = sem.year === "1" ? "1st Year" : 
                      sem.year === "2" ? "2nd Year" : 
                      sem.year === "3" ? "3rd Year" : 
                      `${sem.year}th Year`;
          
          const semester = sem.sem === "1" ? "1st Sem" : 
                          sem.sem === "2" ? "2nd Sem" : 
                          sem.sem === "3" ? "Mid Year" : 
                          `Semester ${sem.sem}`;
          
          return `${year} ${semester}`;
        });
        
        // Update each course's prescribed year and semester
        coursesByType[type].forEach((course, index) => {
          // Assign courses to semesters in a round-robin fashion
          const semesterInfo = semestersInfo[index % semestersInfo.length];
          course.prescribed_year = semesterInfo.year;
          course.prescribed_semester = semesterInfo.sem;
          course.prescribed_note = formattedSemesters;
        });
      }
    }
  });
  
  // Determine which course types to display
  const courseTypes = Object.keys(coursesByType).filter(type => 
    type !== 'REQUIRED' && 
    type !== 'REQUIRED_ACADEMIC' && 
    type !== 'REQUIRED_NON_ACADEMIC'
  );

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
  
  if (loading) {
    return <LoadingSpinner fullPage />;
  }
  
  return (
    <div className="w-full max-w-full">
      <PageHeader 
        title="Academic Progress" 
        description="Track your progress towards completing your degree requirements."
      />
      
      <div className="container mx-auto p-4 max-w-7xl">
        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overall progress and course requirements cards side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall progress bar - 50% width */}
              <div className="h-[240px]">
                <Card className="h-full">
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
                  <CardContent className="pt-2">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Course Completion</span>
                          <span className="text-sm font-medium text-gray-700">0 of 0 courses</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-2 rounded-full bg-blue-600 transition-all duration-1000 ease-in-out"
                            style={{ width: "0%" }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                          <h3 className="text-2xl font-bold text-blue-600">{completedCourses}</h3>
                          <p className="text-xs text-blue-700 font-medium">Completed</p>
                        </div>
                        
                        <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                          <h3 className="text-2xl font-bold text-amber-600">{remainingCourses}</h3>
                          <p className="text-xs text-amber-700 font-medium">Remaining</p>
                        </div>
                        
                        <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                          <h3 className="text-2xl font-bold text-green-600">{completionPercentage}%</h3>
                          <p className="text-xs text-green-700 font-medium">Overall</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Course type summary - 50% width */}
              <div className="h-[240px]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Course Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-3.5rem)]">
                    <div className="grid grid-cols-2 gap-3 h-full">
                      {courseTypes.length > 0 ? (
                        <>
                          <div className="space-y-2">
                            {courseTypes.slice(0, Math.ceil(courseTypes.length / 2)).map(type => {
                              const stats = getStatsForType(type);
                              const typeName = getCourseTypeName(type);
                              return (
                                <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded-md min-w-0">
                                  <span className="text-xs font-medium text-gray-600 truncate">{typeName}</span>
                                  <span className="text-sm font-semibold flex-shrink-0 ml-2">{stats.completed}/{stats.total}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="space-y-2">
                            {courseTypes.slice(Math.ceil(courseTypes.length / 2)).map(type => {
                              const stats = getStatsForType(type);
                              const typeName = getCourseTypeName(type);
                              return (
                                <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded-md min-w-0">
                                  <span className="text-xs font-medium text-gray-600 truncate">{typeName}</span>
                                  <span className="text-sm font-semibold flex-shrink-0 ml-2">{stats.completed}/{stats.total}</span>
                                </div>
                              );
                            })}
                            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md border border-blue-100 min-w-0">
                              <span className="text-xs font-medium text-blue-600 truncate">Total</span>
                              <span className="text-sm font-semibold text-blue-600 flex-shrink-0 ml-2">{completedCourses}/{totalRequired}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="col-span-2 p-3 text-center bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500">No course requirements found.</p>
                          <p className="text-xs text-gray-400">Please contact your program administrator if you believe this is an error.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Course type cards */}
            <Card>
              <CardHeader>
                <CardTitle>Course Requirements</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage; 