import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import PageHeader from "@/components/PageHeader";

const ProgressPage = () => {
  const loading = false;

  return (
    <div className="w-full max-w-full">
      <PageHeader title="Academic Progress" />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Degree Progress</CardTitle>
          <CardDescription>Track your journey to graduation</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <ReloadIcon className="h-5 w-5 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="pt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Completion Progress</span>
                  <span className="text-sm font-medium">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "0%" }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Based on your current curriculum requirements
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Completed Courses</CardTitle>
            <CardDescription>Courses you've successfully finished</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <ReloadIcon className="h-5 w-5 animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No completed courses yet. Your academic achievements will appear here as you progress.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Remaining Requirements</CardTitle>
            <CardDescription>Based on your curriculum</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <ReloadIcon className="h-5 w-5 animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Curriculum requirements information will be available soon.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage; 