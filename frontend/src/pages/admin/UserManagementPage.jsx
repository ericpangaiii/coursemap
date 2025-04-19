import { useIsAdmin } from '@/lib/auth.jsx';
import { useEffect, useState, useMemo } from 'react';
import { usersAPI } from '@/lib/api';
import { toast } from "react-hot-toast";
import { Navigate } from 'react-router-dom';
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

const UserManagementPage = () => {
  const isAdmin = useIsAdmin();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    role: [],
    program: [],
    curriculum: []
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

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
        setLoading(false);
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = sortedUsers.slice(startIndex, endIndex);

  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="container mx-auto p-2">
      <PageHeader title="User Management" />
      
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
                      className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Program
                      {filters.program.length > 0 && (
                        <span className="ml-1 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
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
                      className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Curriculum
                      {filters.curriculum.length > 0 && (
                        <span className="ml-1 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
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
                      className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,25%)]"
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Role
                      {filters.role.length > 0 && (
                        <span className="ml-1 text-xs bg-gray-100 dark:bg-[hsl(220,10%,25%)] px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
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
                  <th className={`text-left py-2 px-2 w-56 ${
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
                      <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        {user.id === isAdmin.id ? (
                          <span className="text-gray-500">N/A</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete user"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
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
    </div>
  );
};

export default UserManagementPage; 