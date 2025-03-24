import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardPage = () => {
  return (
    <div className="w-full max-w-full">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Welcome to CourseMap</CardTitle>
          <CardDescription>Your academic journey at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Dashboard content coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage; 