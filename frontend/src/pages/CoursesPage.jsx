import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";
import PageHeader from "@/components/PageHeader";

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const loading = false;

  return (
    <div className="w-full max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <PageHeader title="Course Catalog" />
        <div className="mt-4 md:mt-0 w-full md:w-1/3">
          <Input
            type="search"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
          <CardDescription>
            Browse and search through available courses in your curriculum
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <ReloadIcon className="h-5 w-5 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : (
            <p className="text-gray-500">
              Course listing will be available soon.
            </p>
          )}
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recommended Courses</CardTitle>
            <CardDescription>Based on your progress</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <ReloadIcon className="h-5 w-5 animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <p className="text-gray-500">
                Recommendations will be available after you've completed some courses.
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Semester</CardTitle>
            <CardDescription>Courses in your current term</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <ReloadIcon className="h-5 w-5 animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <p className="text-gray-500">
                You haven't added any courses for the current semester yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoursesPage; 