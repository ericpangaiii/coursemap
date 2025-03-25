import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import PageHeader from "@/components/PageHeader";
import { curriculumsAPI } from "@/lib/api";
import CourseTypeCard from "@/components/Progress/CourseTypeCard";
import { AlertCircle } from "lucide-react";

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
    
    console.log("Processing course:", {
      id: course.course_id,
      code: course.course_code,
      title: course.title,
      type: type,
      originalType: courseType
    });
    
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(course);
    return acc;
  }, {});
  
  // Debug output for GE Electives specifically
  console.log("GE Elective courses:", coursesByType.ge_elective || []);
  
  // Remove duplicates from all course types
  Object.keys(coursesByType).forEach(type => {
    if (coursesByType[type] && coursesByType[type].length > 1) {
      // Create a map to track unique course IDs
      const uniqueCourses = new Map();
      
      // Keep only the first occurrence of each course ID
      coursesByType[type] = coursesByType[type].filter(course => {
        if (uniqueCourses.has(course.course_id)) {
          return false;
        }
        uniqueCourses.set(course.course_id, true);
        return true;
      });
      
      console.log(`After removing duplicates, ${type} course count:`, coursesByType[type].length);
    }
  });
  
  // Remove duplicates from "required" courses that already exist in other categories
  if (coursesByType.required && (coursesByType.elective || coursesByType.ge_elective)) {
    const otherCourseIds = new Set();
    
    // Collect course IDs from other course types
    ['elective', 'ge_elective', 'cognate', 'specialized', 'track', 'major'].forEach(type => {
      if (coursesByType[type]) {
        coursesByType[type].forEach(course => {
          otherCourseIds.add(course.course_id);
        });
      }
    });
    
    // Filter out required courses that are already in other categories
    coursesByType.required = coursesByType.required.filter(course => !otherCourseIds.has(course.course_id));
    
    console.log("After removing duplicates, required course count:", coursesByType.required.length);
  }
  
  console.log("Courses grouped by type:", coursesByType);
  console.log("Course types found:", Object.keys(coursesByType));
  
  // Calculate stats for each course type
  const getStatsForType = (type) => {
    if (!curriculumData || !curriculumData.totals) return { total: 0 };
    
    // Convert type to the corresponding field names in the totals object
    const countField = `${type}_count`;
    const total = curriculumData.totals[countField] || 0;
    
    // Placeholder for completed courses (will be implemented later)
    const completed = 0;
    const percentage = 0;
    
    return {
      total,
      completed,
      percentage,
      available: (coursesByType[type] || []).length
    };
  };
  
  // List of course types to display
  const courseTypes = [
    "major",
    "ge_elective",
    "elective",
    "cognate", 
    "specialized",
    "track",
    "required"
  ].filter(type => {
    // Only show course types that exist in the curriculum
    if (!curriculumData || !curriculumData.totals) return false;
    const countField = `${type}_count`;
    return curriculumData.totals[countField] > 0;
  });

  // Calculate overall stats as placeholders
  const totalCourses = curriculumData?.totals?.total_count || 0;
  const completedCourses = 0; // Placeholder
  const overallPercentage = 0; // Placeholder
  
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
                  {overallPercentage}%
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
                      Just starting
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-3 rounded-full bg-blue-600 transition-all duration-1000 ease-in-out"
                      style={{ width: `${overallPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="text-3xl font-bold text-blue-600">{completedCourses}</h3>
                    <p className="text-sm text-blue-700 font-medium mt-1">Courses Completed</p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <h3 className="text-3xl font-bold text-amber-600">{totalCourses - completedCourses}</h3>
                    <p className="text-sm text-amber-700 font-medium mt-1">Courses Remaining</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h3 className="text-3xl font-bold text-green-600">{overallPercentage}%</h3>
                    <p className="text-sm text-green-700 font-medium mt-1">Overall Completion</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course type summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Requirements Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {courseTypes.map(type => {
                  const stats = getStatsForType(type);
                  const typeName = getReadableTypeName(type);
                  
                  return (
                    <div key={type} className="border rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-500">{typeName}</h3>
                      <p className="text-2xl font-bold">{stats.completed}/{stats.total}</p>
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${stats.percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {/* Total courses */}
                <div className="border rounded-md p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-500">Total Courses</h3>
                  <p className="text-2xl font-bold">0/{curriculumData?.totals?.total_count || "N/A"}</p>
                  <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "0%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Course type cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseTypes.map(type => (
              <CourseTypeCard
                key={type}
                type={type}
                courses={coursesByType[type] || []}
                stats={getStatsForType(type)}
              />
            ))}
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
  
  const names = {
    'major': 'Major Courses',
    'required': 'Required Courses',
    'ge_elective': 'GE Electives',
    'elective': 'Electives',
    'cognate': 'Cognate Courses',
    'specialized': 'Specialized',
    'track': 'Track Courses'
  };
  return names[standardType] || type;
};

export default ProgressPage; 