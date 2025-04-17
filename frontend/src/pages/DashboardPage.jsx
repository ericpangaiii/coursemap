import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import { AlertCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { programsAPI, curriculumsAPI, plansAPI } from "@/lib/api";
import CompactPlanView from "@/components/Plan/CompactPlanView";
import { LoadingSpinner } from "@/components/ui/loading";
import { computeCumulativeGWA } from "@/lib/utils";

const DashboardPage = () => {
  const { user } = useAuth();
  const [programTitle, setProgramTitle] = useState("Not assigned");
  const [curriculumName, setCurriculumName] = useState("Not assigned");
  const [college, setCollege] = useState("Not assigned");
  const [loading, setLoading] = useState(true);
  const [organizedCourses, setOrganizedCourses] = useState({});
  const [currentCWA, setCurrentCWA] = useState(null);

  // Add this function to handle grade updates
  const handleGradeChange = (courseId, newGrade) => {
    setOrganizedCourses(prevCourses => {
      const updatedCourses = { ...prevCourses };
      
      // Find and update the course with the new grade
      Object.keys(updatedCourses).forEach(year => {
        Object.keys(updatedCourses[year]).forEach(sem => {
          updatedCourses[year][sem] = updatedCourses[year][sem].map(course => {
            if (course.course_id === courseId) {
              return { ...course, grade: newGrade };
            }
            return course;
          });
        });
      });
      
      // Update CWA immediately
      const newCWA = computeCumulativeGWA(updatedCourses);
      setCurrentCWA(newCWA);
      
      return updatedCourses;
    });
  };

  // Function to fetch and organize plan data
  const fetchAndOrganizePlanData = async () => {
    try {
      // Fetch plan data
      const planData = await plansAPI.getCurrentPlan();

      // Organize courses by year and semester
      const organized = {};
      if (planData?.courses) {
        planData.courses.forEach(course => {
          const year = course.year;
          const sem = course.sem;
          
          if (!organized[year]) {
            organized[year] = {};
          }
          
          if (!organized[year][sem]) {
            organized[year][sem] = [];
          }
          
          // Add the course to the organized structure
          organized[year][sem].push(course);
        });
      }
      setOrganizedCourses(organized);
      // Calculate initial CWA
      setCurrentCWA(computeCumulativeGWA(organized));
    } catch (error) {
      console.error("Error fetching plan data:", error);
    }
  };

  useEffect(() => {
    // Set default loading state
    setLoading(true);

    const fetchData = async () => {
      try {
        // Fetch program details if user has a program_id
        if (user?.program_id) {
          const programData = await programsAPI.getProgramById(user.program_id);
          if (programData) {
            setProgramTitle(programData.title);
            setCollege(programData.college || "Not assigned");
          }
        }

        // Fetch curriculum details if user has a curriculum_id
        if (user?.curriculum_id) {
          const curriculumData = await curriculumsAPI.getCurriculumById(user.curriculum_id);
          if (curriculumData && curriculumData.name) {
            setCurriculumName(curriculumData.name);
          }
        }

        // Fetch and organize plan data
        await fetchAndOrganizePlanData();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.program_id, user?.curriculum_id]);

  // Calculate total required courses
  const calculateTotalRequired = () => {
    if (!organizedCourses) return 0;
    
    let total = 0;
    Object.values(organizedCourses).forEach(year => {
      Object.values(year).forEach(semester => {
        total += semester.length;
      });
    });
    return total;
  };

  const totalRequired = calculateTotalRequired();

  // Calculate completed courses
  const calculateCompletedCourses = () => {
    if (!organizedCourses) return 0;
    
    let completed = 0;
    Object.values(organizedCourses).forEach(year => {
      Object.values(year).forEach(semester => {
        semester.forEach(course => {
          if (course.grade && !['5.00', 'INC', 'DRP'].includes(course.grade)) {
            completed++;
          }
        });
      });
    });
    return completed;
  };

  const completedCourses = calculateCompletedCourses();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="w-full max-w-full p-2">
      <PageHeader title="Dashboard" />
      
      <div className="container mx-auto max-w-7xl">
        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Welcome, {user?.name || 'Student'}!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-10 gap-4">
                  <div className="col-span-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">Degree Program</div>
                    <div className="text-base font-bold text-blue-600 dark:text-blue-300">
                      {programTitle}
                    </div>
                  </div>
                  <div className="col-span-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <div className="text-xs text-purple-700 dark:text-purple-400 mb-1">Curriculum</div>
                    <div className="text-base font-bold text-purple-600 dark:text-purple-300">
                      {curriculumName}
                    </div>
                  </div>
                  <div className="col-span-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="text-xs text-green-700 dark:text-green-400 mb-1">College</div>
                    <div className="text-base font-bold text-green-600 dark:text-green-300">
                      {college}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900 dark:text-gray-100">Overall Degree Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 pt-4">
                {/* Progress Card - 60% width */}
                <div className="w-[70%] p-4 border dark:border-gray-700 rounded-lg shadow-md">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">Course Completion</div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {totalRequired === 0 ? 'No courses in plan yet' : `${completedCourses} of ${totalRequired} courses`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-3 rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-1000 ease-in-out"
                      style={{ width: `${totalRequired > 0 ? (completedCourses / totalRequired) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* CWA Card - 40% width */}
                <div className="w-[30%] p-4 border dark:border-gray-700 rounded-lg shadow-md">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">Running CWA</div>
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {currentCWA?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan View */}
        <CompactPlanView 
          organizedCourses={organizedCourses}
          onOrganizedCoursesChange={setOrganizedCourses}
          onGradeChange={handleGradeChange}
          onPlanCreated={fetchAndOrganizePlanData}
        />
      </div>
    </div>
  );
};

export default DashboardPage; 