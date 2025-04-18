import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Expand, Search, SearchX, ChevronDown, CheckCircle2, Info, Filter, X } from "lucide-react";
import { getCourseTypeName, getCourseTypeColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { plansAPI } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CourseItem from "../CourseItem";

const CourseTypeCard = ({ type, courses, stats }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [planCourses, setPlanCourses] = useState([]);
  const typeName = getCourseTypeName(type);
  const typeColor = getCourseTypeColor(type);
  
  // Fetch plan courses when component mounts
  useEffect(() => {
    const fetchPlanCourses = async () => {
      try {
        const planData = await plansAPI.getCurrentPlan();
        if (planData?.courses) {
          setPlanCourses(planData.courses);
        }
      } catch (error) {
        console.error('Error fetching plan courses:', error);
      }
    };
    
    fetchPlanCourses();
  }, []);
  
  const filterCourses = (courses) => {
    let filtered = courses;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.course_code.toLowerCase().includes(query) || 
        course.title.toLowerCase().includes(query)
      );
    }
    
    // Apply semester filter
    if (selectedSemesters.length > 0) {
      filtered = filtered.filter(course => {
        // Check if course is offered exclusively in any of the selected semesters
        const semesters = course.sem_offered?.split(',').map(s => s.trim().toLowerCase()) || [];
        const isExclusive = semesters.length === 1 && selectedSemesters.some(sem => 
          (sem === 'M' && semesters[0] === 'm') || 
          (sem !== 'M' && semesters[0] === `${sem}s`)
        );
        
        // Also check plan data
        const planSemester = planCourses.find(pc => 
          pc.course_id === course.course_id && 
          selectedSemesters.includes(pc.sem)
        );
        
        return isExclusive || planSemester;
      });
    }
    
    // Apply status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(course => {
        const planCourse = planCourses.find(pc => String(pc.course_id) === course.course_id);
        if (!planCourse) return false;
        
        return selectedStatuses.some(status => {
          if (status === 'completed') {
            return planCourse.grade && !['5.00', 'INC', 'DRP'].includes(planCourse.grade);
          } else if (status === 'taken') {
            return planCourse.grade && ['5.00', 'INC', 'DRP'].includes(planCourse.grade);
          } else if (status === 'planned') {
            return !planCourse.grade;
          }
          return false;
        });
      });
    }
    return filtered;
  };

  const filteredCourses = filterCourses(courses);

  return (
    <>
      <Card>
        <CardHeader className="pt-2.5 pb-0 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-1 h-4 rounded ${typeColor}`}></div>
              <CardTitle className="text-sm font-medium">{typeName}</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 ml-0 px-2 text-xs text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
              onClick={() => setIsDialogOpen(true)}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-2.5 px-3">
          <div className="space-y-3.5">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between mb-2 pr-1.5">
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Completion</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{stats.completed}/{stats.total}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="h-2.5 rounded-full bg-blue-600 dark:bg-blue-500" 
                  style={{ 
                    width: `${stats.percentage}%`,
                    transition: 'width 1s ease-in-out'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View All Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {typeName}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Search bar outside Card */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-7 text-xs bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Filter controls outside Card */}
          <div className="flex items-center justify-between">
            <div className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    Sems Offered
                    {selectedSemesters.length > 0 && (
                      <span className="ml-1 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                        {selectedSemesters.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                  <div 
                    className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                      selectedSemesters.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                    }`}
                    onClick={() => selectedSemesters.length > 0 && setSelectedSemesters([])}
                  >
                    <X className="w-3 h-3" />
                    <span className="text-xs">Clear</span>
                  </div>
                  {['1', '2', 'M'].map((sem) => {
                    const isSelected = selectedSemesters.includes(sem);
                    const label = sem === '1' ? '1S' : sem === '2' ? '2S' : 'M';
                    return (
                      <DropdownMenuItem 
                        key={sem}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedSemesters(prev => 
                            isSelected 
                              ? prev.filter(s => s !== sem)
                              : [...prev, sem]
                          );
                        }}
                        className="flex items-center gap-2 py-1.5 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-3 w-3 rounded border-gray-300 dark:border-[hsl(220,10%,20%)] text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs">{label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    Status
                    {selectedStatuses.length > 0 && (
                      <span className="ml-1 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                        {selectedStatuses.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                  <div 
                    className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                      selectedStatuses.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                    }`}
                    onClick={() => selectedStatuses.length > 0 && setSelectedStatuses([])}
                  >
                    <X className="w-3 h-3" />
                    <span className="text-xs">Clear</span>
                  </div>
                  {['planned', 'completed', 'taken'].map((status) => {
                    const isSelected = selectedStatuses.includes(status);
                    const label = status === 'planned' ? 'Planned' : 
                                status === 'completed' ? 'Completed' : 
                                'Taken';
                    return (
                      <DropdownMenuItem 
                        key={status}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedStatuses(prev => 
                            isSelected 
                              ? prev.filter(s => s !== status)
                              : [...prev, status]
                          );
                        }}
                        className="flex items-center gap-2 py-1.5 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-3 w-3 rounded border-gray-300 dark:border-[hsl(220,10%,20%)] text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs">{label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <ScrollArea className="max-h-[65vh]">
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Courses</h3>
              </div>
              <div className="space-y-2">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course, index) => (
                    <CourseItem 
                      key={index}
                      course={course}
                      type={type}
                      showStatus={true}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400 min-h-[300px]">
                    <SearchX className="h-12 w-12 mb-3" />
                    <p className="text-sm font-medium">No courses found</p>
                    <p className="text-sm">Try adjusting your search query or filters</p>
                  </div>
                )}
              </div>
            </Card>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseTypeCard; 