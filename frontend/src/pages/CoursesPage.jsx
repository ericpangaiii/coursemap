import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { coursesAPI, plansAPI } from "@/lib/api";
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, Filter, SearchX, X, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const CoursesPage = () => {
  const [activeTab, setActiveTab] = useState("all"); // "all", "plan"
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    type: [],
    semOffered: [],
    acadGroup: [],
    units: [],
    whenTaken: []
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  // Fetch courses based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let coursesData;
        let planResponse;
        let allCoursesResponse;

        switch (activeTab) {
          case "plan":
            planResponse = await plansAPI.getCurrentPlan();
            coursesData = planResponse?.courses || [];
            // For plan courses, we want to keep duplicates but ensure they're unique instances
            coursesData = coursesData.map((course, index) => ({
              ...course,
              unique_id: `${course.course_id}_${index}` // Add a unique identifier for each instance
            }));
            break;
          default:
            allCoursesResponse = await coursesAPI.getAllCourses();
            coursesData = allCoursesResponse.success ? allCoursesResponse.data : [];
            // Remove duplicates based on course_id only for non-plan courses
            coursesData = coursesData.reduce((acc, current) => {
              const x = acc.find(item => item.course_id === current.course_id);
              if (!x) {
                return acc.concat([current]);
              } else {
                return acc;
              }
            }, []);
        }
        
        setCourses(coursesData);
        setFilteredCourses(coursesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const getUniqueValues = (key) => {
    const values = courses.map(course => course[key]);
    if (key === 'sem_offered') {
      const allSemesters = values
        .filter(Boolean)
        .flatMap(sem => sem.split(',').map(s => s.trim()))
        .filter(sem => ['1S', '2S', 'M'].includes(sem));
      return [...new Set(allSemesters)].sort((a, b) => {
        const order = { '1S': 1, '2S': 2, 'M': 3 };
        return order[a] - order[b];
      });
    } else if (key === 'units') {
      const allUnits = values
        .filter(Boolean)
        .flatMap(unit => unit.split(',').map(u => u.trim()))
        .filter(unit => unit !== '--');
      return [...new Set(allUnits)].sort((a, b) => parseFloat(a) - parseFloat(b));
    }
    return [...new Set(values.filter(Boolean))].sort();
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
  };

  const clearFilter = (filterType) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: []
    }));
  };

  // Filter courses based on search and filters
  useEffect(() => {
    let filtered = [...courses];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(course => 
        course.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter(course => 
        filters.type.includes(course.course_type)
      );
    }
    
    // Apply semester filter
    if (filters.semOffered.length > 0) {
      filtered = filtered.filter(course => {
        if (!course.sem_offered) return false;
        const courseSemesters = course.sem_offered.split(',').map(s => s.trim());
        // Check if the course is offered exclusively in any of the selected semesters
        return filters.semOffered.some(sem => 
          courseSemesters.length === 1 && courseSemesters[0] === sem
        );
      });
    }
    
    // Apply when taken filter
    if (filters.whenTaken?.length > 0) {
      filtered = filtered.filter(course => {
        if (!course.year || !course.sem) return false;
        const whenTaken = `${course.year}Y ${course.sem === 1 ? "1S" : course.sem === 2 ? "2S" : "M"}`;
        return filters.whenTaken.includes(whenTaken);
      });
    }
    
    // Apply academic group filter
    if (filters.acadGroup.length > 0) {
      filtered = filtered.filter(course => 
        filters.acadGroup.includes(course.acad_group)
      );
    }
    
    // Apply units filter
    if (filters.units.length > 0) {
      filtered = filtered.filter(course => 
        filters.units.includes(course.units)
      );
    }
    
    setFilteredCourses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [courses, searchQuery, filters]);

  // Sort courses based on sort configuration
  const sortedCourses = useMemo(() => {
    if (!sortConfig.key) return filteredCourses;

    return [...filteredCourses].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredCourses, sortConfig]);

  const handleSort = (key, direction) => {
    if (direction === 'clear') {
      setSortConfig({ key: null, direction: 'ascending' });
    } else {
      setSortConfig({ key, direction });
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp className="w-3 h-3 ml-1 text-primary" /> 
      : <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = sortedCourses.slice(startIndex, endIndex);

  return (
    <div className="w-full max-w-full p-2">
      {isLoading ? (
        <div className="fixed inset-0 flex justify-center items-center">
          <LoadingSpinner className="w-8 h-8" />
        </div>
      ) : (
        <>
          <PageHeader title="Course Catalog" />
          
          {/* Main Content Card */}
          <Card className="mb-6 w-full max-w-[1300px]">
            <CardContent className="p-6">
              {/* Tabs */}
              <div className="flex space-x-1 mb-6 border-b">
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
                    activeTab === "all"
                      ? "bg-blue-600 dark:bg-blue-500 text-white"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-[hsl(220,10%,25%)]"
                  }`}
                  onClick={() => {
                    setActiveTab("all");
                    setSearchQuery("");
                    setFilters({
                      type: [],
                      semOffered: [],
                      acadGroup: [],
                      units: [],
                      whenTaken: []
                    });
                  }}
                >
                  All Courses
                </button>
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
                    activeTab === "plan"
                      ? "bg-blue-600 dark:bg-blue-500 text-white"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-[hsl(220,10%,25%)]"
                  }`}
                  onClick={() => {
                    setActiveTab("plan");
                    setSearchQuery("");
                    setFilters({
                      type: [],
                      semOffered: [],
                      acadGroup: [],
                      units: [],
                      whenTaken: []
                    });
                  }}
                >
                  Plan of Coursework Courses
                </button>
              </div>
              
              {/* Search and Filters */}
              <div className="space-y-3">
                {/* Search Bar and Filters Row */}
                <div className="flex items-center gap-6">
                  {/* Search Bar - 40% width */}
                  <div className="w-2/5">
                    <Input
                      placeholder="Search by course code or title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-8 text-xs"
                    />
                  </div>
                  
                  {/* Rows per page dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                      >
                        {itemsPerPage} items
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                      <DropdownMenuItem 
                        onClick={() => setItemsPerPage(5)}
                        className={`py-1.5 ${
                          itemsPerPage === 5 
                            ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                        }`}
                      >
                        <span className="text-xs">5 items</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setItemsPerPage(10)}
                        className={`py-1.5 ${
                          itemsPerPage === 10 
                            ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                        }`}
                      >
                        <span className="text-xs">10 items</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setItemsPerPage(20)}
                        className={`py-1.5 ${
                          itemsPerPage === 20 
                            ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                        }`}
                      >
                        <span className="text-xs">20 items</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Filter Controls - 60% width */}
                  <div className="w-3/5 flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                        >
                          <Filter className="w-4 h-4 mr-1" />
                          Course Type
                          {filters.type.length > 0 && (
                            <span className="ml-1 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                              {filters.type.length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                        <div 
                          className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                            filters.type.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                          }`}
                          onClick={() => filters.type.length > 0 && clearFilter('type')}
                        >
                          <X className="w-3 h-3" />
                          <span className="text-xs">Clear</span>
                        </div>
                        {getUniqueValues('course_type').map(type => (
                          <DropdownMenuItem 
                            key={type}
                            onClick={(e) => {
                              e.preventDefault();
                              handleFilterChange('type', type);
                            }}
                            className="flex items-center gap-2 py-1.5"
                          >
                            <input
                              type="checkbox"
                              checked={filters.type.includes(type)}
                              onChange={() => {}}
                              className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs">{type}</span>
                          </DropdownMenuItem>
                        ))}
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
                          College
                          {filters.acadGroup.length > 0 && (
                            <span className="ml-1 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                              {filters.acadGroup.length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                        <ScrollArea className="h-[120px]">
                          <div 
                            className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                              filters.acadGroup.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                            }`}
                            onClick={() => filters.acadGroup.length > 0 && clearFilter('acadGroup')}
                          >
                            <X className="w-3 h-3" />
                            <span className="text-xs">Clear</span>
                          </div>
                          {getUniqueValues('acad_group').map(group => (
                            <DropdownMenuItem 
                              key={group}
                              onClick={(e) => {
                                e.preventDefault();
                                handleFilterChange('acadGroup', group);
                              }}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={filters.acadGroup.includes(group)}
                                onChange={() => {}}
                                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs">{group}</span>
                            </DropdownMenuItem>
                          ))}
                        </ScrollArea>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {activeTab !== "plan" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                          >
                            <Filter className="w-4 h-4 mr-1" />
                            Sems Offered
                            {filters.semOffered.length > 0 && (
                              <span className="ml-1 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                                {filters.semOffered.length}
                              </span>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                          <div 
                            className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                              filters.semOffered.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                            }`}
                            onClick={() => filters.semOffered.length > 0 && clearFilter('semOffered')}
                          >
                            <X className="w-3 h-3" />
                            <span className="text-xs">Clear</span>
                          </div>
                          {getUniqueValues('sem_offered').map((sem) => (
                            <DropdownMenuItem 
                              key={sem}
                              onClick={(e) => {
                                e.preventDefault();
                                handleFilterChange('semOffered', sem);
                              }}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={filters.semOffered.includes(sem)}
                                onChange={() => {}}
                                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs">{sem}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {activeTab === "plan" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                          >
                            <Filter className="w-4 h-4 mr-1" />
                            When Taken
                            {filters.whenTaken?.length > 0 && (
                              <span className="ml-1 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                                {filters.whenTaken.length}
                              </span>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                          <ScrollArea className="h-[120px]">
                            <div 
                              className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                                filters.whenTaken?.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                              }`}
                              onClick={() => filters.whenTaken?.length > 0 && clearFilter('whenTaken')}
                            >
                              <X className="w-3 h-3" />
                              <span className="text-xs">Clear</span>
                            </div>
                            {courses
                              .filter(course => course.year && course.sem)
                              .map(course => `${course.year}Y ${course.sem === 1 ? "1S" : course.sem === 2 ? "2S" : "M"}`)
                              .filter((value, index, self) => self.indexOf(value) === index)
                              .sort((a, b) => {
                                const [yearA, semA] = a.split(' ');
                                const [yearB, semB] = b.split(' ');
                                if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
                                const semOrder = { '1S': 1, '2S': 2, 'M': 3 };
                                return semOrder[semA] - semOrder[semB];
                              })
                              .map((value) => (
                                <DropdownMenuItem 
                                  key={value}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleFilterChange('whenTaken', value);
                                  }}
                                  className="flex items-center gap-2 py-1.5"
                                >
                                  <input
                                    type="checkbox"
                                    checked={filters.whenTaken?.includes(value)}
                                    onChange={() => {}}
                                    className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-xs">{value}</span>
                                </DropdownMenuItem>
                              ))}
                          </ScrollArea>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                        >
                          <Filter className="w-4 h-4 mr-1" />
                          Units
                          {filters.units.length > 0 && (
                            <span className="ml-1 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                              {filters.units.length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                        <ScrollArea className="h-[120px]">
                          <div 
                            className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                              filters.units.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                            }`}
                            onClick={() => filters.units.length > 0 && clearFilter('units')}
                          >
                            <X className="w-3 h-3" />
                            <span className="text-xs">Clear</span>
                          </div>
                          {getUniqueValues('units').map((unit) => (
                            <DropdownMenuItem 
                              key={unit}
                              onClick={(e) => {
                                e.preventDefault();
                                handleFilterChange('units', unit);
                              }}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={filters.units.includes(unit)}
                                onChange={() => {}}
                                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs">{unit} units</span>
                            </DropdownMenuItem>
                          ))}
                        </ScrollArea>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course List Card */}
          <Card className="mb-6 w-full max-w-[1300px]">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                  {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[400px] w-full">
                  <LoadingSpinner className="w-8 h-8" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="text-xs text-gray-500 dark:text-gray-400">
                        <th className="text-left py-2 px-2 w-12 text-gray-500 dark:text-gray-400">#</th>
                        <th className={`text-left py-2 px-2 w-64 ${
                          sortConfig.key === 'course_code' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                        } rounded-md`}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                                Course Code and Title
                                {getSortIcon('course_code')}
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[140px]">
                              <DropdownMenuItem 
                                onClick={() => handleSort('course_code', 'ascending')}
                                className={`flex items-center gap-2 py-1.5 ${
                                  sortConfig.key === 'course_code' && sortConfig.direction === 'ascending' 
                                    ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                }`}
                              >
                                <ArrowUp className="w-3 h-3" />
                                <span className="text-xs">Ascending</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSort('course_code', 'descending')}
                                className={`flex items-center gap-2 py-1.5 ${
                                  sortConfig.key === 'course_code' && sortConfig.direction === 'descending' 
                                    ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                }`}
                              >
                                <ArrowDown className="w-3 h-3" />
                                <span className="text-xs">Descending</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSort('course_code', 'clear')}
                                disabled={!sortConfig.key}
                                className={`flex items-center gap-2 py-1.5 ${
                                  !sortConfig.key 
                                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                }`}
                              >
                                <X className="w-3 h-3" />
                                <span className="text-xs">Clear</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </th>
                        <th className={`text-left py-2 px-3 w-80 ${
                          sortConfig.key === 'description' ? 'bg-gray-50 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100 rounded-md' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          Description
                        </th>
                        <th className={`text-left py-2 px-2 w-48 ${
                          sortConfig.key === 'course_type' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                        } rounded-md`}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                                Course Type
                                {getSortIcon('course_type')}
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[140px]">
                              <DropdownMenuItem 
                                onClick={() => handleSort('course_type', 'ascending')}
                                className={`flex items-center gap-2 py-1.5 ${
                                  sortConfig.key === 'course_type' && sortConfig.direction === 'ascending' 
                                    ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                }`}
                              >
                                <ArrowUp className="w-3 h-3" />
                                <span className="text-xs">Ascending</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSort('course_type', 'descending')}
                                className={`flex items-center gap-2 py-1.5 ${
                                  sortConfig.key === 'course_type' && sortConfig.direction === 'descending' 
                                    ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                }`}
                              >
                                <ArrowDown className="w-3 h-3" />
                                <span className="text-xs">Descending</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSort('course_type', 'clear')}
                                disabled={!sortConfig.key}
                                className={`flex items-center gap-2 py-1.5 ${
                                  !sortConfig.key 
                                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                }`}
                              >
                                <X className="w-3 h-3" />
                                <span className="text-xs">Clear</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </th>
                        <th className={`text-left py-2 px-2 w-24 ${
                          sortConfig.key === 'acad_group' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                        } rounded-md`}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                                College
                                {getSortIcon('acad_group')}
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[140px]">
                              <DropdownMenuItem 
                                onClick={() => handleSort('acad_group', 'ascending')}
                                className={`flex items-center gap-2 py-1.5 ${
                                  sortConfig.key === 'acad_group' && sortConfig.direction === 'ascending' 
                                    ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                }`}
                              >
                                <ArrowUp className="w-3 h-3" />
                                <span className="text-xs">Ascending</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSort('acad_group', 'descending')}
                                className={`flex items-center gap-2 py-1.5 ${
                                  sortConfig.key === 'acad_group' && sortConfig.direction === 'descending' 
                                    ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                }`}
                              >
                                <ArrowDown className="w-3 h-3" />
                                <span className="text-xs">Descending</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSort('acad_group', 'clear')}
                                disabled={!sortConfig.key}
                                className={`flex items-center gap-2 py-1.5 ${
                                  !sortConfig.key 
                                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                }`}
                              >
                                <X className="w-3 h-3" />
                                <span className="text-xs">Clear</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </th>
                        {activeTab !== "plan" && (
                          <th className={`text-left py-2 px-3 w-32 ${
                            sortConfig.key === 'sem_offered' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                          } rounded-md`}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                                  Sems Offered
                                  {getSortIcon('sem_offered')}
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-[140px]">
                                <DropdownMenuItem 
                                  onClick={() => handleSort('sem_offered', 'ascending')}
                                  className={`flex items-center gap-2 py-1.5 ${
                                    sortConfig.key === 'sem_offered' && sortConfig.direction === 'ascending' 
                                      ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                  }`}
                                >
                                  <ArrowUp className="w-3 h-3" />
                                  <span className="text-xs">Ascending</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleSort('sem_offered', 'descending')}
                                  className={`flex items-center gap-2 py-1.5 ${
                                    sortConfig.key === 'sem_offered' && sortConfig.direction === 'descending' 
                                      ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                  }`}
                                >
                                  <ArrowDown className="w-3 h-3" />
                                  <span className="text-xs">Descending</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleSort('sem_offered', 'clear')}
                                  disabled={!sortConfig.key}
                                  className={`flex items-center gap-2 py-1.5 ${
                                    !sortConfig.key 
                                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                  }`}
                                >
                                  <X className="w-3 h-3" />
                                  <span className="text-xs">Clear</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </th>
                        )}
                        {activeTab === "plan" && (
                          <th className={`text-left py-2 px-3 w-32 ${
                            sortConfig.key === 'year' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                          } rounded-md`}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                                  When Taken
                                  {getSortIcon('year')}
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-[140px]">
                                <DropdownMenuItem 
                                  onClick={() => handleSort('year', 'ascending')}
                                  className={`flex items-center gap-2 py-1.5 ${
                                    sortConfig.key === 'year' && sortConfig.direction === 'ascending' 
                                      ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                  }`}
                                >
                                  <ArrowUp className="w-3 h-3" />
                                  <span className="text-xs">Ascending</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleSort('year', 'descending')}
                                  className={`flex items-center gap-2 py-1.5 ${
                                    sortConfig.key === 'year' && sortConfig.direction === 'descending' 
                                      ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                  }`}
                                >
                                  <ArrowDown className="w-3 h-3" />
                                  <span className="text-xs">Descending</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleSort('year', 'clear')}
                                  disabled={!sortConfig.key}
                                  className={`flex items-center gap-2 py-1.5 ${
                                    !sortConfig.key 
                                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                  }`}
                                >
                                  <X className="w-3 h-3" />
                                  <span className="text-xs">Clear</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </th>
                        )}
                        <th className={`text-left py-2 px-2 w-32 ${
                          sortConfig.key === 'units' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                        } rounded-md`}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                                Units
                                {getSortIcon('units')}
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[140px]">
                              <DropdownMenuItem 
                                onClick={() => handleSort('units', 'ascending')}
                                className={`flex items-center gap-2 py-1.5 ${
                                  sortConfig.key === 'units' && sortConfig.direction === 'ascending' 
                                    ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                }`}
                              >
                                <ArrowUp className="w-3 h-3" />
                                <span className="text-xs">Ascending</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSort('units', 'descending')}
                                className={`flex items-center gap-2 py-1.5 ${
                                  sortConfig.key === 'units' && sortConfig.direction === 'descending' 
                                    ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                }`}
                              >
                                <ArrowDown className="w-3 h-3" />
                                <span className="text-xs">Descending</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSort('units', 'clear')}
                                disabled={!sortConfig.key}
                                className={`flex items-center gap-2 py-1.5 ${
                                  !sortConfig.key 
                                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                                }`}
                              >
                                <X className="w-3 h-3" />
                                <span className="text-xs">Clear</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCourses.length > 0 ? (
                        currentCourses.map((course, index) => (
                          <tr 
                            key={activeTab === "plan" ? course.unique_id : course.course_id}
                            className={`${
                              index % 2 === 1 
                                ? 'bg-gray-50 dark:bg-[hsl(220,10%,11%)]' 
                                : ''
                            } hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,14%)] transition-colors`}
                          >
                            <td className="py-2 px-2 text-sm text-gray-500">
                              {startIndex + currentCourses.indexOf(course) + 1}
                            </td>
                            <td className="py-2 px-2">
                              <div className="space-y-0.5">
                                <div className="font-medium text-gray-900 dark:text-gray-100">{course.course_code}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-300">{course.title}</div>
                              </div>
                            </td>
                            <td className="py-2 px-2">
                              <div className="text-xs text-gray-600 dark:text-gray-300">
                                {course.description}
                              </div>
                            </td>
                            <td className="py-2 px-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs whitespace-normal py-0.5"
                              >
                                {course.course_type}
                              </Badge>
                            </td>
                            <td className="py-2 px-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs whitespace-normal py-0.5"
                              >
                                {course.acad_group}
                              </Badge>
                            </td>
                            {activeTab !== "plan" && (
                              <td className="py-2 px-2">
                                {course.sem_offered && (
                                  <Badge variant="outline" className="text-xs whitespace-normal py-0.5">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {course.sem_offered}
                                  </Badge>
                                )}
                              </td>
                            )}
                            {activeTab === "plan" && (
                              <td className="py-2 px-2">
                                <Badge variant="outline" className="text-xs whitespace-normal py-0.5">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {course.year}Y {course.sem === 1 ? "1S" : course.sem === 2 ? "2S" : "M"}
                                </Badge>
                              </td>
                            )}
                            <td className="py-2 px-2">
                              <Badge variant="outline" className="text-xs whitespace-normal py-0.5">
                                {course.units} units
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={activeTab === "plan" ? "8" : "7"} className="py-8">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <SearchX className="h-12 w-12 mb-3" />
                              <p className="text-sm font-medium">No courses found</p>
                              <p className="text-sm">Try adjusting your search query or filters</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
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
        </>
      )}
    </div>
  );
};

export default CoursesPage;