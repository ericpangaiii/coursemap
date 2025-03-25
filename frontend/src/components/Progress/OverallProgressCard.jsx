import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const OverallProgressCard = ({ stats, curriculumName }) => {
  const getCompletionText = () => {
    if (stats.percentage === 100) return "Completed! 🎓";
    if (stats.percentage >= 75) return "Almost there!";
    if (stats.percentage >= 50) return "Making good progress";
    if (stats.percentage >= 25) return "On your way";
    return "Just starting";
  };
  
  return (
    <Card className="col-span-full shadow-sm bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Overall Academic Progress</CardTitle>
          <div className={`px-3 py-1 rounded text-sm font-medium ${
            stats.percentage === 100 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {stats.percentage}%
          </div>
        </div>
        <CardDescription>
          {curriculumName ? `${curriculumName} Curriculum` : 'Your academic journey'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Course Completion</span>
              <span className="text-sm font-medium text-gray-700">
                {getCompletionText()}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ease-in-out ${
                  stats.percentage === 100 
                    ? 'bg-green-500' 
                    : 'bg-blue-600'
                }`}
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-3xl font-bold text-blue-600">{stats.completed}</h3>
              <p className="text-sm text-blue-700 font-medium mt-1">Courses Completed</p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <h3 className="text-3xl font-bold text-amber-600">{stats.total - stats.completed}</h3>
              <p className="text-sm text-amber-700 font-medium mt-1">Courses Remaining</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="text-3xl font-bold text-green-600">{stats.percentage}%</h3>
              <p className="text-sm text-green-700 font-medium mt-1">Overall Completion</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverallProgressCard; 