import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCourseTypeColor } from "@/lib/utils";

const FinalizePlan = ({ allSelections, loading }) => {
  // Calculate totals
  const calculateTotals = () => {
    let totalCourses = 0;
    let totalUnits = 0;

    Object.values(allSelections).forEach(data => {
      if (data.courses) {
        totalCourses += data.courses.length;
        totalUnits += data.courses.reduce((sum, course) => sum + (Number(course.units) || 0), 0);
      }
    });

    return { totalCourses, totalUnits };
  };

  const { totalCourses, totalUnits } = calculateTotals();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold mb-4">Plan Summary</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-xs font-medium text-gray-500">
              <div>Course Type</div>
              <div className="text-center">Number of Courses</div>
              <div className="text-center">Total Units</div>
            </div>
            
            {Object.entries(allSelections).map(([type, data]) => {
              const courseCount = data.courses?.length || 0;
              const unitTotal = data.courses?.reduce((sum, course) => sum + (Number(course.units) || 0), 0) || 0;
              
              return (
                <div key={type} className="grid grid-cols-3 gap-4 items-center">
                  <div className="flex items-center">
                    <div className={`w-2 h-6 rounded mr-2 ${getCourseTypeColor(type)}`}></div>
                    <span className="text-sm">
                      {type === 'ge_elective' ? 'GE Elective' : type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-center text-sm">{courseCount}</div>
                  <div className="text-center text-sm">{unitTotal}</div>
                </div>
              );
            })}
            
            <div className="border-t pt-4 grid grid-cols-3 gap-4 font-medium text-sm">
              <div>Total</div>
              <div className="text-center">{totalCourses}</div>
              <div className="text-center">{totalUnits}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold mb-2">Next Steps</h3>
          <div className="text-sm text-gray-700">
            <p>After completing your plan, you will be able to:</p>
            <ul className="list-disc list-inside mt-2">
              <li>View your complete coursework plan in the dashboard</li>
              <li>Edit or modify your plan as needed</li>
              <li>Export your plan for reference</li>
              <li>Track your progress throughout your academic journey</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinalizePlan; 