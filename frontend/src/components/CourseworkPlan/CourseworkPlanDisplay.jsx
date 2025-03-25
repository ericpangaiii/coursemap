import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import { plansAPI } from "@/lib/api";
import PlanYearCard from "./PlanYearCard";

const CourseworkPlanDisplay = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organizedCourses, setOrganizedCourses] = useState({});

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
        setError("Failed to load your coursework plan");
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
          <span>Loading your coursework plan...</span>
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
    <div className="space-y-6">
      {Object.keys(displayCourses).sort().map(year => (
        <PlanYearCard 
          key={year} 
          year={year} 
          yearData={displayCourses[year]} 
        />
      ))}
    </div>
  );
};

export default CourseworkPlanDisplay; 