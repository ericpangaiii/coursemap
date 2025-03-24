import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CoursesPage = () => {
  return (
    <div className="w-full max-w-full">
      <h1 className="text-2xl font-bold mb-6">Course Catalog</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
          <CardDescription>
            Browse and search through available courses in your curriculum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Course listing coming soon...</p>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recommended Courses</CardTitle>
            <CardDescription>Based on your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Recommended courses coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Semester</CardTitle>
            <CardDescription>Courses in your current term</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Current semester courses coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoursesPage; 