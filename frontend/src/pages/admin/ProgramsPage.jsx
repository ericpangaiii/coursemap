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
import { programsAPI } from "@/lib/api";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Search, SearchX, X } from "lucide-react";
import { useEffect, useState } from "react";

const AdminProgramsPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [pendingChanges, setPendingChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPrograms, setTotalPrograms] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Program color mapping
  const programColors = {
    'BACA': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'BASOC': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'BSBIO': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'BSCHEM': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'BAPHLO': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    'BSAM': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'BSAP': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'BSCS': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'BSMATH': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    'BSAC': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    'BSMST': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    'BSSTAT': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
  };

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const response = await programsAPI.getAllPrograms(currentPage, itemsPerPage);
      setTotalPrograms(response.total);
      setTotalPages(response.totalPages);
      
      // Apply search filtering
      const filtered = response.data.filter(program => 
        program.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Apply sorting
      const sorted = [...filtered].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (sortConfig.direction === 'ascending') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      setFilteredPrograms(sorted);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [searchQuery, sortConfig, currentPage, itemsPerPage]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
    setPendingChanges(false);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  return (
    <div className="container mx-auto">
      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : (
        <div className="container mx-auto p-2">
          <PageHeader title="Programs Management" />

          <Card className="mb-6 w-full max-w-[1300px]">
            <CardContent className="p-6">
              {/* Search Bar and Items Per Page */}
              <div className="space-y-3">
                <div className="flex items-center gap-6">
                  {/* Search Bar - 40% width */}
                  <div className="w-2/5 flex gap-2">
                    <Input
                      placeholder="Search by program acronym or title..."
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
                        onClick={() => {
                          setItemsPerPage(5);
                          setCurrentPage(1);
                        }}
                        className={`py-1.5 ${
                          itemsPerPage === 5 
                            ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                        }`}
                      >
                        <span className="text-xs">5 items</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setItemsPerPage(10);
                          setCurrentPage(1);
                        }}
                        className={`py-1.5 ${
                          itemsPerPage === 10 
                            ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                        }`}
                      >
                        <span className="text-xs">10 items</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setItemsPerPage(20);
                          setCurrentPage(1);
                        }}
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programs List Card */}
          <Card className="mb-6 w-full max-w-[1300px]">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
                  {totalPrograms} {totalPrograms === 1 ? 'program' : 'programs'} found
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
                        sortConfig.key === 'acronym' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      } rounded-md`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                              Acronym
                              {getSortIcon('acronym')}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[140px]">
                            <DropdownMenuItem 
                              onClick={() => setSortConfig({ key: 'acronym', direction: 'asc' })}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'acronym' && sortConfig.direction === 'asc' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setSortConfig({ key: 'acronym', direction: 'desc' })}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'acronym' && sortConfig.direction === 'desc' 
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
                      <th className={`text-left py-2 px-2 w-64 ${
                        sortConfig.key === 'title' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      } rounded-md`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                              Title
                              {getSortIcon('title')}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[140px]">
                            <DropdownMenuItem 
                              onClick={() => setSortConfig({ key: 'title', direction: 'asc' })}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'title' && sortConfig.direction === 'asc' 
                                  ? 'bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(220,10%,20%)]'
                              }`}
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setSortConfig({ key: 'title', direction: 'desc' })}
                              className={`flex items-center gap-2 py-1.5 ${
                                sortConfig.key === 'title' && sortConfig.direction === 'desc' 
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
                      <th className="text-left py-2 px-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrograms.length > 0 ? (
                      filteredPrograms.map((program, index) => (
                        <tr 
                          key={program.program_id} 
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
                            <Badge 
                              variant="outline" 
                              className={`text-xs whitespace-normal py-0.5 ${
                                programColors[program.acronym] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                              }`}
                            >
                              {program.acronym}
                            </Badge>
                          </td>
                          <td className="py-2 px-2">
                            <div className="text-xs text-gray-900 dark:text-gray-100">
                              {program.title}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                              {program.description}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <SearchX className="h-12 w-12 mb-3" />
                            <p className="text-sm font-medium">No programs found</p>
                            <p className="text-sm">Try adjusting your search query</p>
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
        </div>
      )}
    </div>
  );
};

export default AdminProgramsPage; 