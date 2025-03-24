import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProgressPage = () => {
  return (
    <div className="w-full max-w-full">
      <h1 className="text-2xl font-bold mb-6">Academic Progress</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Degree Progress</CardTitle>
          <CardDescription>Track your journey to graduation</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Degree progress visualization coming soon...</p>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Completed Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Completed courses list coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Remaining Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Remaining requirements list coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage; 