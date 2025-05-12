import PageHeader from "@/components/PageHeader";
import CompactPlanView from "@/components/Plan/CompactPlanView";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { plansAPI, usersAPI } from '@/lib/api';
import { useIsAdmin } from '@/lib/auth.jsx';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, FileText, Filter, SearchX, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from 'react';
import { toast } from "react-hot-toast";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";

const UserManagementPage = () => {
  const isAdmin = useIsAdmin();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    role: [],
    program: [],
    curriculum: [],
    college: []
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersAPI.getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const getUniqueValues = (key) => {
    const values = users.map(user => user[key]);
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

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply role filter
    if (filters.role.length > 0) {
      filtered = filtered.filter(user => 
        filters.role.includes(user.role)
      );
    }
    
    // Apply program filter
    if (filters.program.length > 0) {
      filtered = filtered.filter(user => 
        filters.program.includes(user.program_acronym)
      );
    }
    
    // Apply curriculum filter
    if (filters.curriculum.length > 0) {
      filtered = filtered.filter(user => 
        filters.curriculum.includes(user.curriculum_name)
      );
    }
    
    // Apply college filter
    if (filters.college.length > 0) {
      filtered = filtered.filter(user => 
        filters.college.includes(user.college)
      );
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [users, searchQuery, filters]);

  // Sort users based on sort configuration
  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredUsers, sortConfig]);

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

  const handleDeleteClick = (user) => {
    if (user.role === 'Admin' && user.id === isAdmin.id) {
      toast.error("You cannot delete your own admin account");
      return;
    }
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const success = await usersAPI.deleteUser(userToDelete.id);
      if (success) {
        setUsers(users.filter(user => user.id !== userToDelete.id));
        toast.success(`Deleted ${userToDelete.name}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete ${userToDelete.name}`);
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleViewClick = async (user) => {
    try {
      setIsLoadingPlan(true);
      setSelectedUser(user);
      setViewModalOpen(true);
      
      const plans = await plansAPI.getAllPlansByUserId(user.id);
      if (plans && plans.length > 0) {
        setSelectedPlan(plans[0]);
      } else {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast.error('Failed to fetch plan data');
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const organizeCoursesByYearAndSemester = (courses) => {
    const organized = {};
    
    courses.forEach(course => {
      const year = course.year;
      const sem = course.sem;
      
      if (!organized[year]) {
        organized[year] = {};
      }
      
      if (!organized[year][sem]) {
        organized[year][sem] = [];
      }
      
      organized[year][sem].push({
        ...course,
        course_id: course.id
      });
    });
    
    return organized;
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = sortedUsers.slice(startIndex, endIndex);

  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="container mx-auto">
      {isLoadingUsers ? (
        <LoadingSpinner fullPage />
      ) : (
        <div className="container mx-auto p-2">
          <PageHeader title="Users Management" />
          
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
                      placeholder="Search by name or email..."
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
                            onClick={() => filters.program.length > 0 && clearFilter('program')}
                          >
                            <X className="w-3 h-3" />
                            <span className="text-xs">Clear</span>
                          </div>
                          {getUniqueValues('program_acronym').map(program => (
                            <DropdownMenuItem 
                              key={program}
                              onClick={(e) => {
                                e.preventDefault();
                                handleFilterChange('program', program);
                              }}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={filters.program.includes(program)}
                                onChange={() => {}}
                                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs">{program}</span>
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
                            filters.curriculum.length > 0 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          } hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]`}
                        >
                          <Filter className="w-4 h-4 mr-1" />
                          Curriculum
                          {filters.curriculum.length > 0 && (
                            <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {filters.curriculum.length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                        <ScrollArea className="h-[120px]">
                          <div 
                            className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                              filters.curriculum.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                            }`}
                            onClick={() => filters.curriculum.length > 0 && clearFilter('curriculum')}
                          >
                            <X className="w-3 h-3" />
                            <span className="text-xs">Clear</span>
                          </div>
                          {getUniqueValues('curriculum_name').map(curriculum => (
                            <DropdownMenuItem 
                              key={curriculum}
                              onClick={(e) => {
                                e.preventDefault();
                                handleFilterChange('curriculum', curriculum);
                              }}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={filters.curriculum.includes(curriculum)}
                                onChange={() => {}}
                                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs">{curriculum}</span>
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
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-8 px-2 ${
                            filters.role.length > 0 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          } hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]`}
                        >
                          <Filter className="w-4 h-4 mr-1" />
                          Role
                          {filters.role.length > 0 && (
                            <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {filters.role.length}
                            </span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-auto bg-white dark:bg-[hsl(220,10%,15%)] border-gray-200 dark:border-[hsl(220,10%,20%)]">
                        <div 
                          className={`flex items-center gap-2 py-1.5 pl-2 rounded-md ${
                            filters.role.length === 0 ? 'text-gray-400 dark:text-gray-500 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,25%)]'
                          }`}
                          onClick={() => filters.role.length > 0 && clearFilter('role')}
                        >
                          <X className="w-3 h-3" />
                          <span className="text-xs">Clear</span>
                        </div>
                        {getUniqueValues('role').map(role => (
                          <DropdownMenuItem 
                            key={role}
                            onClick={(e) => {
                              e.preventDefault();
                              handleFilterChange('role', role);
                            }}
                            className="flex items-center gap-2 py-1.5"
                          >
                            <input
                              type="checkbox"
                              checked={filters.role.includes(role)}
                              onChange={() => {}}
                              className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs">{role}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User List Card */}
          <Card className="mb-6 w-full max-w-[1300px]">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="text-xs text-gray-500 dark:text-gray-400">
                      <th className="text-left py-2 px-2 w-12">#</th>
                      <th className="text-left py-2 px-2 w-16">Photo</th>
                      <th className={`text-left py-2 px-2 w-56 ${
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
                              onClick={() => handleSort('name', 'ascending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'name' && sortConfig.direction === 'ascending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('name', 'descending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'name' && sortConfig.direction === 'descending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowDown className="w-3 h-3" />
                              <span className="text-xs">Descending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('name', 'clear')}
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
                        sortConfig.key === 'email' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      } rounded-md`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                              Email
                              {getSortIcon('email')}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[140px]">
                            <DropdownMenuItem 
                              onClick={() => handleSort('email', 'ascending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'email' && sortConfig.direction === 'ascending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('email', 'descending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'email' && sortConfig.direction === 'descending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowDown className="w-3 h-3" />
                              <span className="text-xs">Descending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('email', 'clear')}
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
                              onClick={() => handleSort('program_acronym', 'ascending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'program_acronym' && sortConfig.direction === 'ascending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('program_acronym', 'descending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'program_acronym' && sortConfig.direction === 'descending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowDown className="w-3 h-3" />
                              <span className="text-xs">Descending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('program_acronym', 'clear')}
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
                      <th className={`text-left py-2 px-2 w-40 ${
                        sortConfig.key === 'curriculum_name' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      } rounded-md`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                              Curriculum
                              {getSortIcon('curriculum_name')}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[140px]">
                            <DropdownMenuItem 
                              onClick={() => handleSort('curriculum_name', 'ascending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'curriculum_name' && sortConfig.direction === 'ascending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('curriculum_name', 'descending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'curriculum_name' && sortConfig.direction === 'descending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowDown className="w-3 h-3" />
                              <span className="text-xs">Descending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('curriculum_name', 'clear')}
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
                      } rounded-md`}>
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
                      <th className={`text-left py-2 px-2 w-24 ${
                        sortConfig.key === 'role' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      } rounded-md`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                              Role
                              {getSortIcon('role')}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[140px]">
                            <DropdownMenuItem 
                              onClick={() => handleSort('role', 'ascending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'role' && sortConfig.direction === 'ascending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('role', 'descending')}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'role' && sortConfig.direction === 'descending' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowDown className="w-3 h-3" />
                              <span className="text-xs">Descending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSort('role', 'clear')}
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
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user, index) => (
                        <tr 
                          key={user.id} 
                          className={`${
                            index % 2 === 1 
                              ? 'bg-gray-50 dark:bg-[hsl(220,10%,11%)]' 
                              : ''
                          } hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,14%)] transition-colors`}
                        >
                          <td className="py-2 px-2 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                          <td className="py-2 px-2">
                            {user.photo && (
                              <img
                                className="h-8 w-8 rounded-full"
                                src={user.photo}
                                alt={user.name}
                              />
                            )}
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{user.name}</td>
                          <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{user.email}</td>
                          <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{user.program_acronym || 'N/A'}</td>
                          <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{user.curriculum_name || 'N/A'}</td>
                          <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{user.college || 'N/A'}</td>
                          <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{user.role}</td>
                          <td className="py-2 px-2">
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => handleViewClick(user)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View plan"
                              >
                                <FileText className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(user)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete user"
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
                            <p className="text-sm font-medium">No users found</p>
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

          <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="mb-3">Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Delete {userToDelete?.name}'s account? This will remove all their data permanently.
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

          {/* View Plan Dialog */}
          <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
            <DialogContent className={`${
              selectedPlan?.courses && selectedPlan.courses.length > 0
                ? 'sm:max-w-[1000px] lg:max-w-[1200px] h-[90vh]' 
                : 'sm:max-w-[600px] h-auto'
            }`}>
              <DialogHeader>
                <DialogTitle>{selectedUser?.name}'s Plan of Coursework</DialogTitle>
              </DialogHeader>
              <ScrollArea className={`${
                selectedPlan?.courses && selectedPlan.courses.length > 0
                  ? 'h-[calc(90vh-6rem)]' 
                  : 'h-auto'
              }`}>
                {isLoadingPlan ? (
                  <div className="flex justify-center items-center h-[calc(90vh-6rem)]">
                    <LoadingSpinner />
                  </div>
                ) : selectedPlan?.courses && selectedPlan.courses.length > 0 ? (
                  <CompactPlanView
                    organizedCourses={organizeCoursesByYearAndSemester(selectedPlan.courses)}
                    onGradeChange={() => {}}
                    hideHeader={true}
                    hideExport={true}
                    hideCard={true}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mb-3" />
                    <p className="text-sm font-medium">No courses in this plan</p>
                    <p className="text-xs mt-1">This plan has not been populated with courses yet</p>
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

export default UserManagementPage;