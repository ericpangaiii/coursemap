import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Expand, Search, SearchX, ChevronDown, CheckCircle2, Info, Filter } from "lucide-react";
import { getCourseTypeName, getCourseTypeColor, getNormalizedCourseType } from "@/lib/utils";
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
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
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
    if (selectedSemester) {
      filtered = filtered.filter(course => {
        // Check if course is offered exclusively in the selected semester
        const semesters = course.sem_offered?.split(',').map(s => s.trim().toLowerCase()) || [];
        const isExclusive = semesters.length === 1 && (
          (selectedSemester === 'M' && semesters[0] === 'm') || 
          (selectedSemester !== 'M' && semesters[0] === `${selectedSemester}s`)
        );
        
        // Also check plan data
        const planSemester = planCourses.find(pc => 
          pc.course_id === course.course_id && 
          pc.sem === selectedSemester
        );
        
        return isExclusive || planSemester;
      });
    }
    
    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(course => {
        const planCourse = planCourses.find(pc => String(pc.course_id) === course.course_id);
        if (!planCourse) return false;
        
        if (selectedStatus === 'completed') {
          return planCourse.grade && !['5.00', 'INC', 'DRP'].includes(planCourse.grade);
        } else if (selectedStatus === 'taken') {
          return planCourse.grade && ['5.00', 'INC', 'DRP'].includes(planCourse.grade);
        } else if (selectedStatus === 'planned') {
          return !planCourse.grade;
        }
        return false;
      });
    }
    return filtered;
  };

  const filteredCourses = filterCourses(courses);

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-1 h-4 rounded ${typeColor}`}></div>
              <CardTitle className="text-sm font-medium">{typeName}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium">Completion</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full ${typeColor}`} 
                  style={{ 
                    width: `${stats.percentage}%`,
                    transition: 'width 1s ease-in-out'
                  }}
                ></div>
              </div>
            </div>
            
            {/* Course list */}
              <div className="space-y-2">
              {courses.length > 0 ? (
                courses.slice(0, 5).map(course => (
                  <div 
                    key={course.course_id} 
                    className="text-xs px-2 py-1.5 rounded bg-gray-50 flex items-center justify-between relative overflow-hidden"
                  >
                    <div 
                      className={`absolute left-0 top-0 bottom-0 w-1 ${!course.is_academic ? 'bg-blue-300' : getCourseTypeColor(getNormalizedCourseType(course.course_type))}`}
                    />
                    <div className="flex-1 min-w-0 ml-1.5">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{course.course_code}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] h-5 ${!course.is_academic ? 'text-gray-500' : ''}`}
                        >
                          {course.units} units
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-sm text-gray-500">No courses found</p>
                </div>
              )}
            </div>

            {/* View all button */}
            {courses.length > 5 && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  onClick={() => setIsDialogOpen(true)}
                >
                  View All
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View All Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium">
                {typeName}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Search bar outside Card */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by course code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 text-sm"
            />
          </div>

          {/* Filter controls outside Card */}
          <div className="flex items-center justify-between">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-gray-500 hover:text-blue-600"
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    {selectedSemester 
                      ? (selectedSemester === '1' ? '1st Sem Only' : 
                         selectedSemester === '2' ? '2nd Sem Only' : 'Mid Year Only')
                      : "All Semesters"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[8rem]">
                  <DropdownMenuItem 
                    onClick={() => setSelectedSemester(null)}
                    className="flex items-center gap-2 py-1.5"
                  >
                    <div className={`w-1 h-3 rounded ${!selectedSemester ? 'bg-gray-900' : 'bg-gray-200'}`} />
                    <span className="text-xs">All Semesters</span>
                  </DropdownMenuItem>
                  {['1', '2', 'M'].map((sem) => {
                    const isSelected = selectedSemester === sem;
                    const label = sem === '1' ? '1st Sem Only' : sem === '2' ? '2nd Sem Only' : 'Mid Year Only';
                    return (
                      <DropdownMenuItem 
                        key={sem}
                        onClick={() => setSelectedSemester(sem)}
                        className="flex items-center gap-2 py-1.5"
                      >
                        <div className={`w-1 h-3 rounded ${isSelected ? 'bg-gray-900' : 'bg-gray-200'}`} />
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
                    className="h-8 px-2 text-gray-500 hover:text-blue-600"
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    {selectedStatus 
                      ? (selectedStatus === 'planned' ? 'Planned' : 
                         selectedStatus === 'completed' ? 'Completed' : 
                         'Taken')
                      : "All Statuses"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[7rem]">
                  <DropdownMenuItem 
                    onClick={() => setSelectedStatus(null)}
                    className="flex items-center gap-2 py-1.5"
                  >
                    <div className={`w-1 h-3 rounded ${!selectedStatus ? 'bg-gray-900' : 'bg-gray-200'}`} />
                    <span className="text-xs">All Statuses</span>
                  </DropdownMenuItem>
                  {['planned', 'completed', 'taken'].map((status) => {
                    const isSelected = selectedStatus === status;
                    const label = status === 'planned' ? 'Planned' : 
                                status === 'completed' ? 'Completed' : 
                                'Taken';
                    return (
                      <DropdownMenuItem 
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className="flex items-center gap-2 py-1.5"
                      >
                        <div className={`w-1 h-3 rounded ${isSelected ? 'bg-gray-900' : 'bg-gray-200'}`} />
                        <span className="text-xs">{label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <ScrollArea className="max-h-[70vh]">
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700">Courses</h3>
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
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500 min-h-[300px]">
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