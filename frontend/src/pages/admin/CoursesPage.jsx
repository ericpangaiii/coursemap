import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { coursesAPI } from '@/lib/api';
import { useIsAdmin } from '@/lib/auth.jsx';
import { getCollegeBadgeColor, getSemesterBadgeColor, getUnitsBadgeColor } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, ChevronDown, Filter, Search, SearchX, X } from "lucide-react";
import { useEffect, useState } from 'react';
import { toast } from "react-hot-toast";
import { Navigate } from 'react-router-dom';

const AdminCoursesPage = () => {
  const isAdmin = useIsAdmin();
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [filters, setFilters] = useState({
    college: [],
    semester: []
  });
  const [selectedFilters, setSelectedFilters] = useState({
    college: [],
    semester: []
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [pendingChanges, setPendingChanges] = useState(false);

  // Hardcoded filter options
  const filterOptions = {
    college: [
      { label: 'CAFS', value: 'CAFS' },
      { label: 'CAS', value: 'CAS' },
      { label: 'CEM', value: 'CEM' },
      { label: 'CEAT', value: 'CEAT' },
      { label: 'CDC', value: 'CDC' },
      { label: 'CHE', value: 'CHE' },
      { label: 'CVM', value: 'CVM' },
      { label: 'CFNR', value: 'CFNR' }
    ],
    semester: [
      { label: '1S', value: '1s' },
      { label: '2S', value: '2s' },
      { label: 'M', value: 'M' }
    ]
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setSelectedFilters(filters);
    setCurrentPage(1);
    setPendingChanges(false);
  };

  // Fetch courses based on filters
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingCourses(true);
      try {
        const response = await coursesAPI.getAllAdminCourses(
          currentPage,
          itemsPerPage,
          searchQuery,
          selectedFilters,
          sortConfig
        );
        if (response.success) {
          setCourses(response.data);
          setTotalCourses(response.total);
        } else {
          setCourses([]);
          setTotalCourses(0);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
        setTotalCourses(0);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, currentPage, itemsPerPage, searchQuery, selectedFilters, sortConfig]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
    setPendingChanges(true);
  };

  const clearFilter = (filterType) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: []
    }));
    setPendingChanges(true);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp className="w-3 h-3 ml-1 text-primary" /> 
      : <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCourses / itemsPerPage);

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

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex-1 overflow-auto">
      {isLoadingCourses ? (
        <LoadingSpinner fullPage />
      ) : (
        <div className="px-8 py-2 pr-12">
          <PageHeader title="Courses Management" />
          
          {/* Main Content Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              {/* Search and Filters */}
              <div className="space-y-3">
                {/* Search Bar and Filters Row */}
                <div className="flex items-center gap-6">
                  {/* Search Bar - 40% width */}
                  <div className="w-2/5 flex gap-2">
                    <Input
                      placeholder="Search by course code or title..."
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        setPendingChanges(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      className="w-full h-8 text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSearch}
                      className="h-8 px-3 relative"
                    >
                      <Search className="w-3 h-3" />
                      {pendingChanges && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                      )}
                    </Button>
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
                          className={`h-8 px-2 ${
                            filters.college.length > 0 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          } hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]`}
                        >
                          <Filter className="w-4 h-4 mr-1" />
                          College
                          {filters.college.length > 0 && (
                            <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
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
                          {filterOptions.college.map(option => (
                            <DropdownMenuItem 
                              key={option.value}
                              onClick={(e) => {
                                e.preventDefault();
                                handleFilterChange('college', option.value);
                              }}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={filters.college.includes(option.value)}
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
                          className={`h-8 px-2 ${
                            filters.semester.length > 0 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          } hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]`}
                        >
                          <Filter className="w-4 h-4 mr-1" />
                          Sems Offered
                          {filters.semester.length > 0 && (
                            <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
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
                          {filterOptions.semester.map(option => (
                            <DropdownMenuItem 
                              key={option.value}
                              onClick={(e) => {
                                e.preventDefault();
                                handleFilterChange('semester', option.value);
                              }}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={filters.semester.includes(option.value)}
                                onChange={() => {}}
                                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs">{option.label}</span>
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
          <Card className="mb-6">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                  {totalCourses} {totalCourses === 1 ? 'course' : 'courses'} found
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="text-xs text-gray-500 dark:text-gray-400">
                      <th className="text-left py-2 px-2 w-12">#</th>
                      <th className={`text-left py-2 px-2 w-64 ${
                        sortConfig.key === 'course_code' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      } rounded-md`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                              Course Code & Title
                              {getSortIcon('course_code')}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                            <DropdownMenuItem 
                              onClick={() => setSortConfig({ key: 'course_code', direction: 'ascending' })}
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
                              onClick={() => setSortConfig({ key: 'course_code', direction: 'descending' })}
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
                              onClick={() => setSortConfig({ key: null, direction: null })}
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
                      <th className="text-left py-2 px-2 w-96">Description</th>
                      <th className={`text-left py-2 px-2 w-32 ${
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
                              onClick={() => setSortConfig({ key: 'acad_group', direction: 'ascending' })}
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
                              onClick={() => setSortConfig({ key: 'acad_group', direction: 'descending' })}
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
                              onClick={() => setSortConfig({ key: null, direction: null })}
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
                              onClick={() => setSortConfig({ key: 'sem_offered', direction: 'ascending' })}
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
                              onClick={() => setSortConfig({ key: 'sem_offered', direction: 'descending' })}
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
                              onClick={() => setSortConfig({ key: null, direction: null })}
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
                      <th className="text-left py-2 px-2 w-20">Units</th>
                      <th className="text-left py-2 px-2 w-40">Requisites</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.length > 0 ? (
                      courses.map((course, index) => (
                        <tr 
                          key={course.course_id} 
                          className={`${
                            index % 2 === 1 
                              ? 'bg-gray-50 dark:bg-[hsl(220,10%,11%)]' 
                              : ''
                          } hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,14%)] transition-colors`}
                        >
                          <td className="py-2 px-2 text-sm text-gray-500 dark:text-gray-400">
                            {((currentPage - 1) * itemsPerPage) + index + 1}
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">
                            <div className="font-medium">{course.course_code}</div>
                            <div className="text-xs text-gray-500">{course.title}</div>
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{course.description}</td>
                          <td className="py-2 px-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs whitespace-normal py-0.5 ${getCollegeBadgeColor(course.acad_group)}`}
                            >
                              {course.acad_group}
                            </Badge>
                          </td>
                          <td className="py-2 px-2">
                            {course.sem_offered && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs whitespace-normal py-0.5 ${getSemesterBadgeColor(course.sem_offered)}`}
                              >
                                <Calendar className="w-3 h-3 mr-1" />
                                {course.sem_offered}
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs whitespace-normal py-0.5 ${getUnitsBadgeColor(course.units)}`}
                            >
                              {course.units} units
                            </Badge>
                          </td>
                          <td className="py-2 px-2">
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                              {(() => {
                                // Check if there are any prerequisites or corequisites
                                const hasPrerequisites = course.requisite_types?.includes('Prerequisite');
                                const hasCorequisites = course.requisite_types?.includes('Corequisite');

                                if (!hasPrerequisites && !hasCorequisites) {
                                  return <span className="text-gray-500 dark:text-gray-400 italic">None</span>;
                                }

                                return (
                                  <div className="flex flex-col gap-1">
                                    {course.requisites === 'None' ? (
                                      <span className="text-gray-500 dark:text-gray-400 italic">None</span>
                                    ) : (
                                      course.requisites.split(',').map((req, idx) => (
                                        <Badge 
                                          key={idx}
                                          variant="outline" 
                                          className="w-fit text-xs bg-white dark:bg-[hsl(220,10%,15%)] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-[hsl(220,10%,20%)]"
                                        >
                                          {req.trim()}
                                        </Badge>
                                      ))
                                    )}
                                  </div>
                                );
                              })()}
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