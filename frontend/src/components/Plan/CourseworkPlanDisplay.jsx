import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import { plansAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, AlertCircle, Plus, FileText } from "lucide-react";
import PlanYearCard from "./PlanYearCard";
import PlanCreationModal from "@/components/Plan/PlanCreationModal";

const CourseworkPlanDisplay = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organizedCourses, setOrganizedCourses] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Check if plan has courses
  const hasCourses = plan?.courses && plan.courses.length > 0;

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const planData = await plansAPI.getCurrentPlan();
        setPlan(planData);
        
        // Organize courses by year and semester
        const organized = {};
        if (planData?.courses) {
          planData.courses.forEach(course => {
            const year = course.year;
            const semester = course.semester;
            
            if (!organized[year]) {
              organized[year] = {};
            }
            
            if (!organized[year][semester]) {
              organized[year][semester] = [];
            }
            
            organized[year][semester].push(course);
          });
        }
        setOrganizedCourses(organized);
      } catch (err) {
        setError("Failed to load your plan");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
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

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          <span>Loading your plan...</span>
        </div>
      </Card>
    );
  }

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Plan of Coursework</h2>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>
      
      {/* Plan Creation Modal */}
      <PlanCreationModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      
      {!hasCourses && (
        <div className="mb-6">
          <div className="flex items-start space-x-2 p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-100 mb-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm">Create a new plan to organize your courses by semester.</p>
            </div>
          </div>
        </div>
      )}
      
      {hasCourses && (
        <div className="flex justify-start mb-4">
          <Button 
            disabled
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Plan</span>
          </Button>
        </div>
      )}
      
      <div className="space-y-6">
        {Object.keys(displayCourses).sort().map(year => (
          <PlanYearCard 
            key={year} 
            year={year} 
            yearData={displayCourses[year]} 
          />
        ))}
      </div>
    </div>
  );
};

export default CourseworkPlanDisplay; 