import { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { coursesAPI, curriculumsAPI, plansAPI } from "@/lib/api";
import { getCourseTypeName } from "@/lib/utils";
import CourseItem from "@/components/CourseItem";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Clock, GraduationCap, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const CoursesPage = () => {
  const [activeTab, setActiveTab] = useState("all"); // "all", "curriculum", "plan"
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    type: "all",
    semOffered: "all",
    acadGroup: "all",
    units: "all"
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  // Fetch courses based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        let coursesData;
        let curriculumResponse;
        let planResponse;
        let allCoursesResponse;

        switch (activeTab) {
          case "curriculum":
            curriculumResponse = await curriculumsAPI.getCurrentCurriculumCourses();
            coursesData = curriculumResponse || [];
            break;
          case "plan":
            planResponse = await plansAPI.getCurrentPlan();
            coursesData = planResponse?.courses || [];
            break;
          default:
            allCoursesResponse = await coursesAPI.getAllCourses();
            coursesData = allCoursesResponse.success ? allCoursesResponse.data : [];
        }
        
        // Remove duplicates based on course_id
        const uniqueCourses = coursesData.reduce((acc, current) => {
          const x = acc.find(item => item.course_id === current.course_id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        
        setCourses(uniqueCourses);
        setFilteredCourses(uniqueCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
        setFilteredCourses([]);
      }
    };

    fetchData();
  }, [activeTab]);

  // Filter courses based on search query and filters
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
    if (filters.type !== "all") {
      filtered = filtered.filter(course => course.course_type === filters.type);
    }

    // Apply semester offered filter
    if (filters.semOffered !== "all") {
      filtered = filtered.filter(course => 
        course.sem_offered?.toLowerCase().includes(filters.semOffered.toLowerCase())
      );
    }

    // Apply academic group filter
    if (filters.acadGroup !== "all") {
      filtered = filtered.filter(course => course.acad_group === filters.acadGroup);
    }

    // Apply units filter
    if (filters.units !== "all") {
      filtered = filtered.filter(course => course.units === filters.units);
    }

    setFilteredCourses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, filters, courses]);

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

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 ml-2 text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp className="w-4 h-4 ml-2 text-primary" /> 
      : <ArrowDown className="w-4 h-4 ml-2 text-primary" />;
  };

  // Get unique values for filters
  const getUniqueValues = (key) => {
    return [...new Set(courses.map(course => course[key]))].filter(Boolean);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = sortedCourses.slice(startIndex, endIndex);

  return (
    <div className="w-full max-w-full p-4">
      <PageHeader title="Course Catalog" />
      
      {/* Main Content Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 border-b">
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
                activeTab === "all"
                  ? "bg-black text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Courses
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
                activeTab === "curriculum"
                  ? "bg-black text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("curriculum")}
            >
              Curriculum Courses
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
                activeTab === "plan"
                  ? "bg-black text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("plan")}
            >
              Plan Courses
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="space-y-3">
            {/* Search Bar and Filters Row */}
            <div className="flex items-center gap-3">
              {/* Search Bar - 60% width */}
              <div className="w-3/5">
                <Input
                  placeholder="Search by course code or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Filter Controls - 40% width */}
              <div className="w-2/5 flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-gray-500 hover:text-blue-600"
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      {filters.type === "all" ? "All Types" : getCourseTypeName(filters.type)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[8rem]">
                    <ScrollArea className="h-[200px]">
                      <DropdownMenuItem 
                        onClick={() => setFilters({ ...filters, type: "all" })}
                        className="flex items-center gap-2 py-1.5"
                      >
                        <div className={`w-1 h-3 rounded ${filters.type === "all" ? 'bg-gray-900' : 'bg-gray-200'}`} />
                        <span className="text-xs">All Types</span>
                      </DropdownMenuItem>
                      {getUniqueValues('course_type').map(type => {
                        const isSelected = filters.type === type;
                        return (
                          <DropdownMenuItem 
                            key={type} 
                            onClick={() => setFilters({ ...filters, type })}
                            className="flex items-center gap-2 py-1.5"
                          >
                            <div className={`w-1 h-3 rounded ${isSelected ? 'bg-gray-900' : 'bg-gray-200'}`} />
                            <span className="text-xs">{getCourseTypeName(type)}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </ScrollArea>
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
                      {filters.semOffered === "all" ? "All Semesters" : filters.semOffered}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[8rem]">
                    <ScrollArea className="h-[200px]">
                      <DropdownMenuItem 
                        onClick={() => setFilters({ ...filters, semOffered: "all" })}
                        className="flex items-center gap-2 py-1.5"
                      >
                        <div className={`w-1 h-3 rounded ${filters.semOffered === "all" ? 'bg-gray-900' : 'bg-gray-200'}`} />
                        <span className="text-xs">All Semesters</span>
                      </DropdownMenuItem>
                      {getUniqueValues('sem_offered').map(sem => {
                        const isSelected = filters.semOffered === sem;
                        return (
                          <DropdownMenuItem 
                            key={sem}
                            onClick={() => setFilters({ ...filters, semOffered: sem })}
                            className="flex items-center gap-2 py-1.5"
                          >
                            <div className={`w-1 h-3 rounded ${isSelected ? 'bg-gray-900' : 'bg-gray-200'}`} />
                            <span className="text-xs">{sem}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </ScrollArea>
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
                      {filters.acadGroup === "all" ? "All Groups" : filters.acadGroup}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[8rem]">
                    <ScrollArea className="h-[200px]">
                      <DropdownMenuItem 
                        onClick={() => setFilters({ ...filters, acadGroup: "all" })}
                        className="flex items-center gap-2 py-1.5"
                      >
                        <div className={`w-1 h-3 rounded ${filters.acadGroup === "all" ? 'bg-gray-900' : 'bg-gray-200'}`} />
                        <span className="text-xs">All Groups</span>
                      </DropdownMenuItem>
                      {getUniqueValues('acad_group').map(group => {
                        const isSelected = filters.acadGroup === group;
                        return (
                          <DropdownMenuItem 
                            key={group}
                            onClick={() => setFilters({ ...filters, acadGroup: group })}
                            className="flex items-center gap-2 py-1.5"
                          >
                            <div className={`w-1 h-3 rounded ${isSelected ? 'bg-gray-900' : 'bg-gray-200'}`} />
                            <span className="text-xs">{group}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </ScrollArea>
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
                      {filters.units === "all" ? "All Units" : filters.units}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[8rem]">
                    <ScrollArea className="h-[200px]">
                      <DropdownMenuItem 
                        onClick={() => setFilters({ ...filters, units: "all" })}
                        className="flex items-center gap-2 py-1.5"
                      >
                        <div className={`w-1 h-3 rounded ${filters.units === "all" ? 'bg-gray-900' : 'bg-gray-200'}`} />
                        <span className="text-xs">All Units</span>
                      </DropdownMenuItem>
                      {getUniqueValues('units').map(units => {
                        const isSelected = filters.units === units;
                        return (
                          <DropdownMenuItem 
                            key={units}
                            onClick={() => setFilters({ ...filters, units })}
                            className="flex items-center gap-2 py-1.5"
                          >
                            <div className={`w-1 h-3 rounded ${isSelected ? 'bg-gray-900' : 'bg-gray-200'}`} />
                            <span className="text-xs">{units}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course List Card */}
      <Card className="mb-6 w-full max-w-[1200px]">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="text-left py-2 px-3 w-16">#</th>
                  <th 
                    className="text-left py-2 px-3 w-96 cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('course_code')}
                  >
                    <div className="flex items-center">
                      Course
                      {getSortIcon('course_code')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-2 px-3 w-48 cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('course_type')}
                  >
                    <div className="flex items-center">
                      Type
                      {getSortIcon('course_type')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-2 px-3 w-24 cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('units')}
                  >
                    <div className="flex items-center">
                      Units
                      {getSortIcon('units')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-2 px-3 w-32 cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('sem_offered')}
                  >
                    <div className="flex items-center">
                      Semester
                      {getSortIcon('sem_offered')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-2 px-3 w-32 cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('acad_group')}
                  >
                    <div className="flex items-center">
                      Group
                      {getSortIcon('acad_group')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-2 px-3 w-32 cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('prerequisites')}
                  >
                    <div className="flex items-center">
                      Prerequisites
                      {getSortIcon('prerequisites')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentCourses.map((course, index) => (
                  <tr 
                    key={course.course_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-3 text-sm text-gray-500">
                      {startIndex + index + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{course.course_code}</div>
                        <div className="text-sm text-gray-600">{course.title}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-xs whitespace-normal">
                        {getCourseTypeName(course.course_type)}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-xs whitespace-normal">
                        {course.units} units
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      {course.sem_offered && (
                        <Badge variant="outline" className="text-xs whitespace-normal">
                          <Calendar className="w-3 h-3 mr-1" />
                          {course.sem_offered}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {course.acad_group && (
                        <Badge variant="outline" className="text-xs whitespace-normal">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          {course.acad_group}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {course.prerequisites && course.prerequisites.length > 0 && (
                        <Badge variant="outline" className="text-xs whitespace-normal">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {course.prerequisites.length}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  className={currentPage === 1 ? "pointer-events-none text-gray-400" : "text-gray-800 hover:bg-gray-100"}
                />
              </PaginationItem>
              
              {/* First page */}
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(1)}
                  className={`${
                    currentPage === 1 
                      ? "bg-primary text-white" 
                      : "text-gray-800 hover:bg-gray-100"
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
                          ? "bg-primary text-white" 
                          : "text-gray-800 hover:bg-gray-100"
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
                        ? "bg-primary text-white" 
                        : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "pointer-events-none text-gray-400" : "text-gray-800 hover:bg-gray-100"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default CoursesPage; 