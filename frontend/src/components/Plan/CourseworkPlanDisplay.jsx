import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import { plansAPI, curriculumsAPI, coursesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Edit, AlertCircle, Plus, FileText } from "lucide-react";
import DetailedYearCard from "./Detailed/DetailedYearCard";
import PlanCreationModal from "@/components/Plan/PlanCreationModal";

const CourseworkPlanDisplay = () => {
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [organizedCourses, setOrganizedCourses] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [curriculumId, setCurriculumId] = useState(null);
  
  // Check if plan has courses
  const hasCourses = plan?.courses && plan.courses.length > 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both plan and curriculum structure
        const [planData, curriculumData] = await Promise.all([
          plansAPI.getCurrentPlan(),
          curriculumsAPI.getCurrentCurriculumStructure()
        ]);
        
        setPlan(planData);
        if (curriculumData?.curriculum_id) {
          setCurriculumId(curriculumData.curriculum_id);
        }
        
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

            console.log('Course details:', {
              course_code: courseWithDetails.course_code,
              title: courseWithDetails.title,
              units: courseWithDetails.units,
              is_academic: courseWithDetails.is_academic,
              course_type: courseWithDetails.course_type
            });
            
            // Check if this course is already in the semester
            const isDuplicate = organized[year][sem].some(
              existingCourse => existingCourse.course_id === course.course_id
            );
            
            if (!isDuplicate) {
              organized[year][sem].push(courseWithDetails);
            }
          });

          // Sort courses by type within each semester
          Object.keys(organized).forEach(year => {
            Object.keys(organized[year]).forEach(sem => {
              organized[year][sem].sort((a, b) => {
                // Define the order of course types
                const typeOrder = {
                  'REQUIRED_ACADEMIC': 1,
                  'REQUIRED_NON_ACADEMIC': 2,
                  'GE_ELECTIVE': 3,
                  'ELECTIVE': 4
                };
                
                // First sort by type
                const typeComparison = (typeOrder[a.course_type] || 99) - (typeOrder[b.course_type] || 99);
                if (typeComparison !== 0) {
                  return typeComparison;
                }
                
                // If same type, sort alphabetically by course code
                return a.course_code.localeCompare(b.course_code);
              });
            });
          });
        }
        setOrganizedCourses(organized);
      } catch (err) {
        setError("Failed to load your plan");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Create a default structure for years 1-4
  const getDefaultYears = () => {
    const years = {};
    for (let year = 1; year <= 4; year++) {
      years[year] = {};
      // Add empty arrays for each semester
      years[year][1] = [];
      years[year][2] = [];
      years[year][3] = [];
    }
    return years;
  };

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center text-red-500">{error}</div>
      </Card>
    );
  }
  
  // Always display the years and semesters, even if plan is empty
  const displayCourses = Object.keys(organizedCourses).length > 0 
    ? organizedCourses 
    : getDefaultYears();

  return (
    <Card>
      <CardHeader className="bg-slate-50">
        <div className="flex justify-between items-center">
          <CardTitle>Plan of Coursework</CardTitle>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="text-sm">
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </Button>
            {!hasCourses ? (
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
            ) : (
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Plan
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
      {/* Plan Creation Modal */}
      <PlanCreationModal 
          isOpen={isCreateModalOpen}
          setIsOpen={setIsCreateModalOpen}
          setPlan={setPlan}
          setOrganizedCourses={setOrganizedCourses}
      />
      
      {!hasCourses && (
          <div className="mb-4">
            <div className="flex items-start space-x-2 p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-100">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm">Create a new plan to organize your courses by semester.</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
          {Object.entries(displayCourses).map(([year, semesters]) => (
            <DetailedYearCard 
            key={year} 
              year={parseInt(year)}
              semesters={semesters}
          />
        ))}
      </div>
      </CardContent>
    </Card>
  );
};

export default CourseworkPlanDisplay; 