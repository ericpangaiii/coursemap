import { useIsAdmin } from '@/lib/auth.jsx';
import { useEffect, useState, useMemo } from 'react';
import { coursesAPI } from '@/lib/api';
import { toast } from "react-hot-toast";
import { Trash2, Filter, SearchX, ChevronDown, X, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageHeader from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/ui/loading";
import { Navigate } from 'react-router-dom';

const AdminCoursesPage = () => {
  const isAdmin = useIsAdmin();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    courseType: [],
    college: [],
    semester: []
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await coursesAPI.getAllCourses();
        setCourses(data);
        setFilteredCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to fetch courses');
      } finally {
        setIsLoadingCourses(false);
      }
    };

    if (isAdmin) {
      fetchCourses();
    }
  }, [isAdmin]);

  const getUniqueValues = (key) => {
    if (!Array.isArray(courses)) return [];
    const values = courses.map(course => course[key]);
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
    if (!Array.isArray(courses)) {
      setFilteredCourses([]);
      return;
    }

    let filtered = [...courses];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(course => 
        course.course_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply course type filter
    if (filters.courseType.length > 0) {
      filtered = filtered.filter(course => 
        filters.courseType.includes(course.course_type)
      );
    }
    
    // Apply college filter
    if (filters.college.length > 0) {
      filtered = filtered.filter(course => 
        filters.college.includes(course.college)
      );
    }
    
    // Apply semester filter
    if (filters.semester.length > 0) {
      filtered = filtered.filter(course => 
        filters.semester.includes(course.semester)
      );
    }
    
    setFilteredCourses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [courses, searchQuery, filters]);

  // Sort courses based on sort configuration
  const sortedCourses = useMemo(() => {
    if (!Array.isArray(filteredCourses)) return [];
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

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const success = await coursesAPI.deleteCourse(courseToDelete.id);
      if (success) {
        setCourses(courses.filter(course => course.id !== courseToDelete.id));
        toast.success(`Deleted ${courseToDelete.course_code}`);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(`Failed to delete ${courseToDelete.course_code}`);
    } finally {
      setDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil((Array.isArray(sortedCourses) ? sortedCourses.length : 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = Array.isArray(sortedCourses) ? sortedCourses.slice(startIndex, endIndex) : [];

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="container mx-auto">
      {isLoadingCourses ? (
        <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="container mx-auto p-2">
          <PageHeader title="Courses Management" />
          
          {/* Main Content Card */}
          <Card className="mb-6 w-full max-w-[1300px]">
            <CardContent className="p-6">
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
                          {filters.courseType.length > 0 && (
                            <span className="ml-1 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                              {filters.courseType.length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                        <ScrollArea className="h-[120px]">
                          <div 
                            className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                              filters.courseType.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                            }`}
                            onClick={() => filters.courseType.length > 0 && clearFilter('courseType')}
                          >
                            <X className="w-3 h-3" />
                            <span className="text-xs">Clear</span>
                          </div>
                          {getUniqueValues('course_type').map(type => (
                            <DropdownMenuItem 
                              key={type}
                              onClick={(e) => {
                                e.preventDefault();
                                handleFilterChange('courseType', type);
                              }}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={filters.courseType.includes(type)}
                                onChange={() => {}}
                                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs">{type}</span>
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
                          <Filter className="w-4 h-4 mr-1" />
                          College
                          {filters.college.length > 0 && (
                            <span className="ml-1 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                              {filters.college.length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                        <ScrollArea className="h-[120px]">
                          <div 
                            className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                              filters.college.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                            }`}
                            onClick={() => filters.college.length > 0 && clearFilter('college')}
                          >
                            <X className="w-3 h-3" />
                            <span className="text-xs">Clear</span>
                          </div>
                          {getUniqueValues('college').map(college => (
                            <DropdownMenuItem 
                              key={college}
                              onClick={(e) => {
                                e.preventDefault();
                                handleFilterChange('college', college);
                              }}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={filters.college.includes(college)}
                                onChange={() => {}}
                                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs">{college}</span>
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
                          <Filter className="w-4 h-4 mr-1" />
                          Semester
                          {filters.semester.length > 0 && (
                            <span className="ml-1 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                              {filters.semester.length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                        <ScrollArea className="h-[120px]">
                          <div 
                            className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                              filters.semester.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                            }`}
                            onClick={() => filters.semester.length > 0 && clearFilter('semester')}
                          >
                            <X className="w-3 h-3" />
                            <span className="text-xs">Clear</span>
                          </div>
                          {getUniqueValues('semester').map(semester => (
                            <DropdownMenuItem 
                              key={semester}
                              onClick={(e) => {
                                e.preventDefault();
                                handleFilterChange('semester', semester);
                              }}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={filters.semester.includes(semester)}
                                onChange={() => {}}
                                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs">{semester}</span>
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

          {/* Courses List Card */}
          <Card className="mb-6 w-full max-w-[1300px]">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                  {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="text-xs text-gray-500 dark:text-gray-400">
                      <th className="text-left py-2 px-2 w-12">#</th>
                      <th className={`text-left py-2 px-2 w-32 ${
                        sortConfig.key === 'course_code' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                              Course Code
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
                      <th className={`text-left py-2 px-2 w-64 ${
                        sortConfig.key === 'title' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                              Title
                              {getSortIcon('title')}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[140px]">
                            <DropdownMenuItem 
                              onClick={() => handleSort('title', 'ascending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'title' && sortConfig.direction === 'ascending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('title', 'descending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'title' && sortConfig.direction === 'descending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowDown className="w-3 h-3" />
                              <span className="text-xs">Descending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('title', 'clear')}
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
                        sortConfig.key === 'units' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
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
                      <th className={`text-left py-2 px-2 w-32 ${
                        sortConfig.key === 'course_type' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                              Type
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
                      <th className={`text-left py-2 px-2 w-32 ${
                        sortConfig.key === 'college' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                              College
                              {getSortIcon('college')}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[140px]">
                            <DropdownMenuItem 
                              onClick={() => handleSort('college', 'ascending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'college' && sortConfig.direction === 'ascending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('college', 'descending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'college' && sortConfig.direction === 'descending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowDown className="w-3 h-3" />
                              <span className="text-xs">Descending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('college', 'clear')}
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
                      <th className="text-left py-2 px-2 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCourses.length > 0 ? (
                      currentCourses.map((course, index) => (
                        <tr 
                          key={course.id} 
                          className={`${
                            index % 2 === 1 
                              ? 'bg-gray-50 dark:bg-[hsl(220,10%,11%)]' 
                              : ''
                          } hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,14%)] transition-colors`}
                        >
                          <td className="py-2 px-2 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                          <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{course.course_code}</td>
                          <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{course.title}</td>
                          <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{course.units}</td>
                          <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">
                            <Badge variant="outline">{course.course_type}</Badge>
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{course.college}</td>
                          <td className="py-2 px-2">
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => handleDeleteClick(course)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete course"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-8">
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
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="mb-3">Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Delete {courseToDelete?.course_code}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={handleDeleteCancel}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default AdminCoursesPage; 