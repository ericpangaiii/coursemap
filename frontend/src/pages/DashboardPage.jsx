import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import { AlertCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { programsAPI, curriculumsAPI, plansAPI, coursesAPI } from "@/lib/api";
import CompactPlanView from "@/components/Plan/CompactPlanView";
import { LoadingSpinner } from "@/components/ui/loading";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [programTitle, setProgramTitle] = useState("Not assigned");
  const [curriculumName, setCurriculumName] = useState("Not assigned");
  const [college, setCollege] = useState("Not assigned");
  const [loading, setLoading] = useState(true);
  const [organizedCourses, setOrganizedCourses] = useState({});

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

        // Fetch plan data
        const planData = await plansAPI.getCurrentPlan();

        // Organize courses by year and semester
        const organized = {};
        if (planData?.courses) {
          // Get all course IDs to fetch descriptions
          const courseIds = planData.courses.map(course => course.course_id);
          
          // Fetch course details including descriptions
          const courseDetailsResponse = await coursesAPI.getCoursesByIds(courseIds);
          
          // Create a map of course_id to course details
          const courseDetailsMap = {};
          if (courseDetailsResponse.success && courseDetailsResponse.data) {
            courseDetailsResponse.data.forEach(course => {
              courseDetailsMap[course.course_id] = course;
            });
          }
          
          // Organize courses with their descriptions
          planData.courses.forEach(course => {
            const year = course.year;
            const sem = course.sem;
            
            if (!organized[year]) {
              organized[year] = {};
            }
            
            if (!organized[year][sem]) {
              organized[year][sem] = [];
            }
            
            // Merge course details with plan course data
            const courseWithDetails = {
              ...course,
              description: courseDetailsMap[course.course_id]?.description || course.description,
              title: courseDetailsMap[course.course_id]?.title || course.title,
              units: courseDetailsMap[course.course_id]?.units || course.units,
              is_academic: courseDetailsMap[course.course_id]?.is_academic,
              course_type: course.course_type === 'REQUIRED' 
                ? courseDetailsMap[course.course_id]?.is_academic 
                  ? 'REQUIRED_ACADEMIC' 
                  : 'REQUIRED_NON_ACADEMIC'
                : course.course_type,
              status: course.status || 'planned',
              grade: course.grade || null
            };
            
            // Check if this course is already in the semester
            const isDuplicate = organized[year][sem].some(
              existingCourse => existingCourse.course_id === course.course_id
            );
            
            if (!isDuplicate) {
              organized[year][sem].push(courseWithDetails);
            }
          });
        }
        setOrganizedCourses(organized);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.program_id, user?.curriculum_id]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="w-full max-w-full">
      <PageHeader title="Dashboard" />
      
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Welcome, {user?.name || 'Student'}!</CardTitle>
              <CardDescription>
                {getGreeting()}, here's your academic overview.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-10 gap-4">
                  <div className="col-span-4 p-4 rounded-lg bg-blue-50">
                    <div className="text-xs text-blue-700 mb-1">Degree Program</div>
                    <div className="text-base font-bold text-blue-600">
                      {programTitle}
                    </div>
                  </div>
                  <div className="col-span-4 p-4 rounded-lg bg-purple-50">
                    <div className="text-xs text-purple-700 mb-1">Curriculum</div>
                    <div className="text-base font-bold text-purple-600">
                      {curriculumName}
                    </div>
                  </div>
                  <div className="col-span-2 p-4 rounded-lg bg-green-50">
                    <div className="text-xs text-green-700 mb-1">College</div>
                    <div className="text-base font-bold text-green-600">
                      {college}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Overall Degree Progress</CardTitle>
                <div className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                  0%
                </div>
              </div>
              <CardDescription>
                {curriculumName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Course Completion</span>
                  <span className="text-sm font-medium text-gray-700">0 of 0 courses</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-3 rounded-full bg-blue-600 transition-all duration-1000 ease-in-out"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan of Coursework */}
        <CompactPlanView organizedCourses={organizedCourses} />
      </div>
    </div>
  );
};

export default DashboardPage; 