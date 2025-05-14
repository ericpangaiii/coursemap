import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { curriculumsAPI } from "@/lib/api";
import { cn, getCourseTypeTextColor } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Filter, Search, SearchX, X } from "lucide-react";
import { useEffect, useState } from 'react';

const AdminCurriculumsPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCurriculums, setTotalCurriculums] = useState(0);
  const [filters, setFilters] = useState({
    program: []
  });
  const [selectedFilters, setSelectedFilters] = useState({
    program: []
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [pendingChanges, setPendingChanges] = useState(false);
  const [curriculums, setCurriculums] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [curriculumStructure, setCurriculumStructure] = useState(null);
  const [requiredCourses, setRequiredCourses] = useState([]);
  const [error, setError] = useState(null);
  const [isLoadingModalData, setIsLoadingModalData] = useState(false);

  // Hardcoded filter options
  const filterOptions = {
    program: [
      { label: 'BACA', value: 'BACA', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      { label: 'BASOC', value: 'BASOC', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      { label: 'BSBIO', value: 'BSBIO', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
      { label: 'BSCHEM', value: 'BSCHEM', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      { label: 'BAPHLO', value: 'BAPHLO', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' },
      { label: 'BSAM', value: 'BSAM', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
      { label: 'BSAP', value: 'BSAP', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      { label: 'BSCS', value: 'BSCS', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
      { label: 'BSMATH', value: 'BSMATH', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
      { label: 'BSAC', value: 'BSAC', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
      { label: 'BSMST', value: 'BSMST', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
      { label: 'BSSTAT', value: 'BSSTAT', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' }
    ]
  };

  const fetchCurriculums = async () => {
    try {
      setIsLoading(true);
      const data = await curriculumsAPI.getAllCurriculums();
      
      // Apply search filter
      let filteredData = data;
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        filteredData = data.filter(curriculum => 
          curriculum.name.toLowerCase().includes(searchLower) ||
          curriculum.code.toLowerCase().includes(searchLower)
        );
      }

      // Apply program filter
      if (selectedFilters.program.length > 0) {
        filteredData = filteredData.filter(curriculum => 
          selectedFilters.program.includes(curriculum.program_acronym)
        );
      }

      // Apply sorting
      if (sortConfig.key) {
        filteredData.sort((a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      setTotalCurriculums(filteredData.length);
      
      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      setCurriculums(paginatedData);
    } catch (err) {
      console.error('Error fetching curriculums:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculums();
  }, [searchQuery, selectedFilters, sortConfig, currentPage, itemsPerPage]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setSelectedFilters(filters);
    setCurrentPage(1);
    setPendingChanges(false);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [filterType]: newValues
      };
    });
    setPendingChanges(true);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  const totalPages = Math.ceil(totalCurriculums / itemsPerPage);

  const handleViewClick = (curriculum) => {
    setSelectedCurriculum(curriculum);
    setViewModalOpen(true);
  };

  // Add useEffect to fetch data when modal opens
  useEffect(() => {
    const fetchCurriculumData = async () => {
      if (viewModalOpen && selectedCurriculum) {
        try {
          setIsLoadingModalData(true);
          setError(null);
          
          // Fetch both curriculum structure and required courses
          const [structureResponse, requiredCoursesResponse] = await Promise.all([
            curriculumsAPI.getCurriculumStructure(selectedCurriculum.curriculum_id),
            curriculumsAPI.getCurriculumRequiredCourses(selectedCurriculum.curriculum_id)
          ]);

          if (!structureResponse.success) {
            throw new Error(structureResponse.error || 'Failed to fetch curriculum structure');
          }

          if (!requiredCoursesResponse.success) {
            throw new Error(requiredCoursesResponse.error || 'Failed to fetch required courses');
          }

          setCurriculumStructure(structureResponse.data);
          setRequiredCourses(requiredCoursesResponse.data);
        } catch (err) {
          console.error('Error fetching curriculum data:', err);
          setError(err.message || 'Failed to fetch curriculum data');
        } finally {
          setIsLoadingModalData(false);
        }
      }
    };

    fetchCurriculumData();
  }, [viewModalOpen, selectedCurriculum]);

  const CourseItem = ({ course }) => {
    const textColor = getCourseTypeTextColor(course.course_type);
    const bgColor = course.course_type === 'Required Academic' 
      ? 'bg-blue-100 dark:bg-blue-900/20' 
      : 'bg-blue-50 dark:bg-blue-900/10';

    return (
      <div className={cn(
        "w-full px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-1.5",
        textColor,
        bgColor
      )}>
        <div className="flex-1">
          <div className={`text-xs font-medium ${textColor}`}>
            {course.course_code}
          </div>
        </div>
      </div>
    );
  };

  const CurriculumPlaceholder = ({ type }) => {
    const textColor = getCourseTypeTextColor(type);
    const bgColor = type === 'GE Elective' 
      ? 'bg-yellow-100 dark:bg-yellow-900/20'
      : type === 'Elective'
      ? 'bg-purple-100 dark:bg-purple-900/20'
      : type === 'Major'
      ? 'bg-green-100 dark:bg-green-900/20'
      : type === 'Cognate'
      ? 'bg-indigo-100 dark:bg-indigo-900/20'
      : type === 'Specialized'
      ? 'bg-teal-100 dark:bg-teal-900/20'
      : 'bg-orange-100 dark:bg-orange-900/20';

    return (
      <div className={cn(
        "w-full px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-1.5",
        textColor,
        bgColor
      )}>
        <div className="flex-1">
          <div className={`text-xs font-medium ${textColor}`}>
            {type}
          </div>
        </div>
      </div>
    );
  };

  const UnitsCounter = ({ units }) => {
    return (
      <div className="text-[10px] text-gray-500 dark:text-gray-400 text-right">
        {units} unit{units !== 1 ? 's' : ''}
      </div>
    );
  };

  // Helper to compute total units for a semester
  const computeSemesterUnits = (year, sem) => {
    // Sum units for required academic courses in this semester
    const courses = requiredCourses.filter(
      course => course.course_type === 'Required Academic' && 
      course.year === year && 
      course.sem === sem
    );
    const academicUnits = courses.reduce((sum, course) => {
      const units = parseFloat(course.units);
      return sum + (isNaN(units) ? 0 : units);
    }, 0);

    // Get the semester data to compute placeholder units
    const semesterData = curriculumStructure.find(
      s => s.year === year && s.sem === sem
    );
    if (!semesterData) return academicUnits;

    // Add units for placeholders
    const placeholderUnits = 
      (semesterData.ge_elective_count * 3) + // GE Electives are 3 units each
      (semesterData.elective_count * 3) +    // Electives are 3 units each
      (semesterData.major_count * 3) +       // Majors are 3 units each
      (semesterData.cognate_count * 3) +     // Cognates are 3 units each
      (semesterData.specialized_count * 3) + // Specialized are 3 units each
      (semesterData.track_count * 3);        // Foundation are 3 units each

    return academicUnits + placeholderUnits;
  };

  return (
    <div className="flex-1 overflow-auto">
      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : (
        <div className="px-8 py-2 pr-12">
          <PageHeader title="Curriculums Management" />
          
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
                      placeholder="Search by curriculum code or name..."
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
                            filters.program.length > 0 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          } hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]`}
                        >
                          <Filter className="w-4 h-4 mr-1" />
                          Program
                          {filters.program.length > 0 && (
                            <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {filters.program.length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                        <ScrollArea className="h-[120px]">
                          <div 
                            className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                              filters.program.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                            }`}
                            onClick={() => {
                              if (filters.program.length > 0) {
                                setFilters(prev => ({
                                  ...prev,
                                  program: []
                                }));
                                setPendingChanges(true);
                              }
                            }}
                          >
                            <X className="w-3 h-3" />
                            <span className="text-xs">Clear</span>
                          </div>
                          {filterOptions.program.map(option => (
                            <DropdownMenuItem 
                              key={option.value}
                              onClick={(e) => {
                                e.preventDefault();
                                handleFilterChange('program', option.value);
                              }}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={filters.program.includes(option.value)}
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

          {/* Curriculums List Card */}
          <Card className="mb-6">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                  {totalCurriculums} {totalCurriculums === 1 ? 'curriculum' : 'curriculums'} found
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="text-xs text-gray-500 dark:text-gray-400">
                      <th className="text-left py-2 px-2 w-12">#</th>
                      <th className={`text-left py-2 px-2 w-48 ${
                        sortConfig.key === 'code' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      } rounded-md`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                              Curriculum Code
                              {getSortIcon('code')}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[140px]">
                            <DropdownMenuItem 
                              onClick={() => setSortConfig({ key: 'code', direction: 'asc' })}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'code' && sortConfig.direction === 'asc' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setSortConfig({ key: 'code', direction: 'desc' })}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'code' && sortConfig.direction === 'desc' 
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
                        sortConfig.key === 'name' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      } rounded-md`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                              Name
                              {getSortIcon('name')}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[140px]">
                            <DropdownMenuItem 
                              onClick={() => setSortConfig({ key: 'name', direction: 'asc' })}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'name' && sortConfig.direction === 'asc' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setSortConfig({ key: 'name', direction: 'desc' })}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'name' && sortConfig.direction === 'desc' 
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
                        sortConfig.key === 'program_acronym' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      } rounded-md`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                              Program
                              {getSortIcon('program_acronym')}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[140px]">
                            <DropdownMenuItem 
                              onClick={() => setSortConfig({ key: 'program_acronym', direction: 'asc' })}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'program_acronym' && sortConfig.direction === 'asc' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setSortConfig({ key: 'program_acronym', direction: 'desc' })}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'program_acronym' && sortConfig.direction === 'desc' 
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
                      <th className="text-left py-2 px-2 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curriculums.length > 0 ? (
                      curriculums.map((curriculum, index) => (
                        <tr 
                          key={curriculum.id} 
                          className={`${
                            index % 2 === 1 
                              ? 'bg-gray-50 dark:bg-[hsl(220,10%,11%)]' 
                              : ''
                          } hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,14%)] transition-colors`}
                        >
                          <td className="py-2 px-2 text-sm text-gray-500 dark:text-gray-400">
                            {((currentPage - 1) * itemsPerPage) + index + 1}
                          </td>
                          <td className="py-2 px-2">
                            <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                              {curriculum.code}
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <div className="text-xs text-gray-900 dark:text-gray-100">
                              {curriculum.name}
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs whitespace-normal py-0.5 ${
                                filterOptions.program.find(p => p.value === curriculum.program_acronym)?.color || ''
                              }`}
                            >
                              {curriculum.program_acronym}
                            </Badge>
                          </td>
                          <td className="py-2 px-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                              onClick={() => handleViewClick(curriculum)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-file-text"
                              >
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" x2="8" y1="13" y2="13" />
                                <line x1="16" x2="8" y1="17" y2="17" />
                                <line x1="10" x2="8" y1="9" y2="9" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <SearchX className="h-12 w-12 mb-3" />
                            <p className="text-sm font-medium">No curriculums found</p>
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
                  ).map(page => 
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
                  )}

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

          {/* View Curriculum Structure Dialog */}
          <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
            <DialogContent className="sm:max-w-[1000px] lg:max-w-[1200px] h-[90vh]">
              <DialogHeader>
                <DialogTitle>{selectedCurriculum?.name} Curriculum Structure</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[calc(90vh-6rem)]">
                {isLoadingModalData ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <LoadingSpinner />
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full text-red-500">
                    {error}
                  </div>
                ) : curriculumStructure ? (
                  <div className="space-y-6 p-4">
                    {/* Year Grid */}
                    <div className="grid grid-cols-4 gap-3">
                      {Array.from({ length: 4 }, (_, yearIndex) => (
                        <Card key={yearIndex} className="h-full">
                          <CardHeader className="pt-3 pb-1 px-3">
                            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {yearIndex + 1 === 1 ? '1st Year' : 
                               yearIndex + 1 === 2 ? '2nd Year' : 
                               yearIndex + 1 === 3 ? '3rd Year' : 
                               '4th Year'}
                            </CardTitle>
        </CardHeader>
                          <CardContent className="flex flex-col gap-3 px-3 py-2 pb-4">
                            {['1', '2', '3'].map((sem) => {
                              const year = (yearIndex + 1).toString();
                              const semesterData = curriculumStructure.find(
                                s => s.year === year && s.sem === sem
                              );

                              if (!semesterData) return null;

                              return (
                                <div
                                  key={`${year}-${sem}`}
                                  className={cn(
                                    "p-2 rounded-lg border border-gray-200 dark:border-gray-800 transition-all relative",
                                    sem === '3' ? 'min-h-[80px]' : 'min-h-[120px]'
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-xs text-gray-600 dark:text-gray-300">
                                      {sem === '1' ? '1st Sem' : sem === '2' ? '2nd Sem' : 'Mid Year'}
                                    </h3>
                                  </div>
                                  <div className="space-y-2">
                                    {/* Required Academic Courses */}
                                    {requiredCourses
                                      .filter(course => 
                                        course.course_type === 'Required Academic' && 
                                        course.year === year && 
                                        course.sem === sem
                                      )
                                      .map((course, i) => (
                                        <CourseItem key={`required-academic-${i}`} course={course} />
                                      ))}

                                    {/* Required Non-Academic Courses */}
                                    {requiredCourses
                                      .filter(course => 
                                        course.course_type === 'Required Non-Academic' && 
                                        course.year === year && 
                                        course.sem === sem
                                      )
                                      .map((course, i) => (
                                        <CourseItem key={`required-non-academic-${i}`} course={course} />
                                      ))}

                                    {/* GE Electives */}
                                    {Array.from({ length: semesterData.ge_elective_count }, (_, i) => (
                                      <CurriculumPlaceholder
                                        key={`ge-elective-${i}`}
                                        type="GE Elective"
                                      />
                                    ))}

                                    {/* Electives */}
                                    {Array.from({ length: semesterData.elective_count }, (_, i) => (
                                      <CurriculumPlaceholder
                                        key={`elective-${i}`}
                                        type="Elective"
                                      />
                                    ))}

                                    {/* Majors */}
                                    {Array.from({ length: semesterData.major_count }, (_, i) => (
                                      <CurriculumPlaceholder
                                        key={`major-${i}`}
                                        type="Major"
                                      />
                                    ))}

                                    {/* Cognates */}
                                    {Array.from({ length: semesterData.cognate_count }, (_, i) => (
                                      <CurriculumPlaceholder
                                        key={`cognate-${i}`}
                                        type="Cognate"
                                      />
                                    ))}

                                    {/* Specialized */}
                                    {Array.from({ length: semesterData.specialized_count }, (_, i) => (
                                      <CurriculumPlaceholder
                                        key={`specialized-${i}`}
                                        type="Specialized"
                                      />
                                    ))}

                                    {/* Foundation */}
                                    {Array.from({ length: semesterData.track_count }, (_, i) => (
                                      <CurriculumPlaceholder
                                        key={`foundation-${i}`}
                                        type="Foundation"
                                      />
                                    ))}

                                    {/* Total */}
                                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-[hsl(220,10%,20%)]">
                                      <div className="flex justify-end">
                                        <UnitsCounter units={computeSemesterUnits(year, sem)} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
        </CardContent>
      </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No curriculum structure data available
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default AdminCurriculumsPage; 