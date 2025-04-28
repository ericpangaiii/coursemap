import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import CourseItem from "@/components/CourseItem";
import { ChevronLeft, ChevronRight, Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const CoursesList = ({ courses, currentStep, totalSteps, onStepChange, semesterGrid }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter out courses that are already in the plan
  const availableCourses = courses.filter(course => {
    // Check if the course is in any semester in the plan
    return !Object.values(semesterGrid).some(semesterCourses => 
      semesterCourses.some(c => c.course_id === course.course_id)
    );
  });

  // Apply search and semester filters
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
      const semesters = course.sem_offered?.split(',').map(s => s.trim().toLowerCase()) || [];
      const isExclusive = semesters.length === 1 && selectedSemesters.some(sem => 
        (sem === 'M' && semesters[0] === 'm') || 
        (sem !== 'M' && semesters[0] === `${sem}s`)
      );
      
      if (!isExclusive) {
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
  }, [searchQuery, selectedSemesters]);

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filter Controls */}
      <div className="px-4 pt-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
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
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pr-4">
          {paginatedCourses.length > 0 ? (
            paginatedCourses.map((course) => (
              <CourseItem 
                key={course.course_id} 
                course={course}
              />
            ))
          ) : (
            <div className="text-sm text-gray-500">No courses available for this step</div>
          )}
        </div>
      </ScrollArea>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 px-4">
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

      <div className="flex justify-between items-center px-4 pt-4">
        <Button
          variant="outline"
          onClick={() => onStepChange(currentStep - 1)}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={() => onStepChange(currentStep + 1)}
          disabled={currentStep === totalSteps - 1}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CoursesList; 