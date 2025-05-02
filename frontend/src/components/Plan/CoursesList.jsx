import CourseItem from "@/components/CourseItem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Filter, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import AssignAllButton from "./AssignAllButton";
import { SearchX } from "lucide-react";

const CoursesList = ({ courses, currentStep, totalSteps, onStepChange, semesterGrid, isTargetReached, courseSteps }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedRequisites, setSelectedRequisites] = useState(false);

  // Get current step type
  const currentStepType = courseSteps[currentStep]?.type;
  const isRequiredType = currentStepType === 'Required Academic' || currentStepType === 'Required Non-Academic';

  // Hardcoded filter options
  const filterOptions = {
    acadGroup: [
      { label: 'CAFS', value: 'CAFS' },
      { label: 'CAS', value: 'CAS' },
      { label: 'CEM', value: 'CEM' },
      { label: 'CEAT', value: 'CEAT' },
      { label: 'CDC', value: 'CDC' },
      { label: 'CHE', value: 'CHE' },
      { label: 'CVM', value: 'CVM' },
      { label: 'CFNR', value: 'CFNR' }
    ]
  };

  // Filter out courses that are already in the plan
  const availableCourses = courses.filter(course => {
    // Check if the course is in any semester in the plan
    return !Object.values(semesterGrid).some(semesterCourses => 
      semesterCourses.some(c => c.id === course.id)
    );
  });

  // Apply all filters
  const filteredCourses = availableCourses.filter(course => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!course.course_code.toLowerCase().includes(query) && 
          !course.title.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Apply semester filter
    if (selectedSemesters.length > 0) {
      const courseSemester = course.sem_offered?.toUpperCase() || '';
      // Check if the course is offered in ANY of the selected semesters
      const isOfferedInSelectedSemester = selectedSemesters.some(sem => {
        // Convert semester codes to match the format in course.sem_offered
        const semesterCode = sem === '1' ? '1S' : sem === '2' ? '2S' : 'M';
        return courseSemester === semesterCode;
      });
      
      if (!isOfferedInSelectedSemester) {
        return false;
      }
    }

    // Apply college filter
    if (selectedColleges.length > 0) {
      const courseCollege = course.acad_group?.toUpperCase() || '';
      // Check if the course belongs to ANY of the selected colleges
      if (!selectedColleges.includes(courseCollege)) {
        return false;
      }
    }

    // Apply requisites filter
    if (selectedRequisites) {
      // Show only courses that have "None" requisites
      if (course.requisites !== "None") {
        return false;
      }
    }
    
    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Clear all filters and search when step changes
  useEffect(() => {
    setSearchQuery("");
    setSelectedSemesters([]);
    setSelectedColleges([]);
    setSelectedRequisites(false);
    setCurrentPage(1);
  }, [currentStep]);

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        {/* Search and Filter Controls */}
        <div className="px-4 pt-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search by course code or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchQuery(e.target.value);
                  }
                }}
                className="pl-7 h-7 text-xs bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery(searchQuery)}
              className="h-7 px-3"
            >
              <Search className="w-3 h-3" />
            </Button>
            {isRequiredType && (
              <div className="ml-2">
                <AssignAllButton 
                  courses={filteredCourses}
                  semesterGrid={semesterGrid}
                  onAssignAll={(newGrid) => {
                    // Update the semester grid through the parent component
                    if (onStepChange) {
                      onStepChange(currentStep, newGrid);
                    }
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                  >
                    <Filter className="w-4 h-4 mr-0.5" />
                    Requisites
                    {selectedRequisites && (
                      <span className="ml-0.5 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                        1
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                  <div 
                    className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                      !selectedRequisites ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                    }`}
                    onClick={() => selectedRequisites && setSelectedRequisites(false)}
                  >
                    <X className="w-3 h-3" />
                    <span className="text-xs">Clear</span>
                  </div>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedRequisites(true);
                    }}
                    className="flex items-center gap-2 py-1.5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRequisites}
                      onChange={() => {}}
                      className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs">No Requisites</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                  >
                    <Filter className="w-4 h-4 mr-0.5" />
                    College
                    {selectedColleges.length > 0 && (
                      <span className="ml-0.5 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                        {selectedColleges.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                  <ScrollArea className="h-[120px]">
                    <div 
                      className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                        selectedColleges.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                      }`}
                      onClick={() => selectedColleges.length > 0 && setSelectedColleges([])}
                    >
                      <X className="w-3 h-3" />
                      <span className="text-xs">Clear</span>
                    </div>
                    {filterOptions.acadGroup.map(option => (
                      <DropdownMenuItem 
                        key={option.value}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedColleges(prev => 
                            prev.includes(option.value)
                              ? prev.filter(col => col !== option.value)
                              : [...prev, option.value]
                          );
                        }}
                        className="flex items-center gap-2 py-1.5"
                      >
                        <input
                          type="checkbox"
                          checked={selectedColleges.includes(option.value)}
                          onChange={() => {}}
                          className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs">{option.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                  >
                    <Filter className="w-4 h-4 mr-0.5" />
                    Sems Offered
                    {selectedSemesters.length > 0 && (
                      <span className="ml-0.5 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
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
            </div>
          </div>
        </div>
        
        <div className="flex-1 px-4">
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="space-y-2 pr-6 pb-4">
              {filteredCourses.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <SearchX className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No courses found
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search query or filters
                  </p>
                </div>
              )}
              {paginatedCourses.length > 0 && (
                paginatedCourses.map((course) => (
                  <CourseItem 
                    key={course.id || course.course_id} 
                    course={course}
                    disabled={isTargetReached}
                    isInCoursesList={true}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 pt-2 pb-3">
            <Pagination>
              <PaginationContent className="text-xs">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"}
                  />
                </PaginationItem>
                
                {/* First page */}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(1)}
                    className={`${
                      currentPage === 1 
                        ? "bg-blue-600 text-white pointer-events-none" 
                        : "text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                    }`}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {/* Show first ellipsis if current page is beyond 3 */}
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Middle pages */}
                {Array.from(
                  { length: Math.min(3, totalPages - 2) },
                  (_, i) => {
                    if (currentPage <= 3) {
                      return i + 2; // Show 2,3,4 when on first pages
                    } else if (currentPage >= totalPages - 2) {
                      return totalPages - 3 + i; // Show last pages when near end
                    } else {
                      return currentPage - 1 + i; // Show current page and neighbors
                    }
                  }
                ).map((page) => (
                  page > 1 && page < totalPages && (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        className={`${
                          currentPage === page 
                            ? "bg-blue-600 text-white pointer-events-none" 
                            : "text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                        }`}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                ))}

                {/* Show second ellipsis if current page is not near the end */}
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Last page */}
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(totalPages)}
                      className={`${
                        currentPage === totalPages 
                          ? "bg-blue-600 text-white pointer-events-none" 
                          : "text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                      }`}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          onClick={() => onStepChange(currentStep - 1)}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {currentStep === totalSteps - 1 ? (
          <Button
            onClick={() => {
              console.log('Plan Courses Data:', {
                courses: filteredCourses,
                semesterGrid,
                currentStep,
                courseSteps,
                isTargetReached
              });
              console.log('Create plan clicked');
            }}
            className="flex items-center gap-2"
          >
            Create Plan
          </Button>
        ) : (
          <Button
            onClick={() => onStepChange(currentStep + 1)}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CoursesList; 