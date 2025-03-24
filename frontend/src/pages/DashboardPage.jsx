import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";

const DashboardPage = () => {
  return (
    <div className="w-full max-w-full">
      <PageHeader title="Dashboard" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to CourseMap</CardTitle>
            <CardDescription>Your academic journey at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your personalized dashboard will show your academic progress and course recommendations based on your curriculum.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Degree Completion</CardTitle>
            <CardDescription>Track your academic progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Completion Progress</span>
                  <span className="text-sm font-medium">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "0%" }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Progress data will be available after completing your first semester.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Semester Plan</CardTitle>
          <CardDescription>Courses you're planning to take this semester</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            You haven't added any courses for the current semester yet. Visit the Courses page to browse and add courses to your plan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage; 