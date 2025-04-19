import { useIsAdmin } from '@/lib/auth.jsx';
import { useEffect, useState } from 'react';
import { plansAPI } from '@/lib/api';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import PageHeader from "@/components/PageHeader";
import { Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CompactPlanView from "@/components/Plan/CompactPlanView";

const UserPlansPage = () => {
  const isAdmin = useIsAdmin();
  const [loading, setLoading] = useState(true);
  const [userPlans, setUserPlans] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await plansAPI.getAllPlans();
        setUserPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setUserPlans([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchPlans();
    }
  }, [isAdmin]);

  const handleDeleteClick = (plan) => {
    setSelectedPlan(plan);
    setDeleteModalOpen(true);
  };

  const handleViewClick = (plan) => {
    setSelectedPlan(plan);
    setViewModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const success = await plansAPI.deletePlan(selectedPlan.id);
      if (success) {
        setUserPlans(userPlans.filter(plan => plan.id !== selectedPlan.id));
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    } finally {
      setDeleteModalOpen(false);
      setSelectedPlan(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedPlan(null);
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
        course_id: course.id,
        _isCurriculumCourse: true
      });
    });
    
    return organized;
  };

  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="w-full max-w-full p-2">
      <PageHeader title="User Plans" />
      
      {/* Main Content Card */}
      <Card className="mb-6 w-full max-w-[1300px]">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[hsl(220,10%,30%)]">
              {userPlans.length} {userPlans.length === 1 ? 'plan' : 'plans'} found
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400">
                  <th className="text-left py-2 px-2 w-12">#</th>
                  <th className="text-left py-2 px-2 w-32">Plan ID</th>
                  <th className="text-left py-2 px-2 w-48">User</th>
                  <th className="text-left py-2 px-2 w-64">Curriculum</th>
                  <th className="text-left py-2 px-2 w-48">Created At</th>
                  <th className="text-left py-2 px-2 w-48">Updated At</th>
                  <th className="text-left py-2 px-2 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userPlans.map((plan, index) => (
                  <tr 
                    key={plan.id} 
                    className={`${
                      index % 2 === 1 
                        ? 'bg-gray-50 dark:bg-[hsl(220,10%,11%)]' 
                        : ''
                    } hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,14%)] transition-colors`}
                  >
                    <td className="py-2 px-2 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                    <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{plan.id}</td>
                    <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{plan.user?.name || 'Unknown User'}</td>
                    <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">{plan.curriculum?.name || 'No Curriculum'}</td>
                    <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">
                      {new Date(plan.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-900 dark:text-gray-100">
                      {new Date(plan.updated_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleViewClick(plan)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View plan"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(plan)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete plan"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-3">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Delete Plan ID: {selectedPlan?.id} by {selectedPlan?.user?.name || 'Unknown User'}? This will remove the plan and all its associated courses data permanently.
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
        <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plan Details</DialogTitle>
            <DialogDescription>
              Plan ID: {selectedPlan?.id} ({selectedPlan?.user?.name || 'Unknown User'})
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Plan Information</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">User</p>
                    <p className="text-sm">{selectedPlan.user?.name || 'Unknown User'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Curriculum</p>
                    <p className="text-sm">{selectedPlan.curriculum?.name || 'No Curriculum'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="text-sm">{new Date(selectedPlan.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Updated At</p>
                    <p className="text-sm">{new Date(selectedPlan.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Courses</h3>
                <div className="mt-2">
                  {selectedPlan.courses?.length > 0 ? (
                    <CompactPlanView 
                      organizedCourses={organizeCoursesByYearAndSemester(selectedPlan.courses)}
                      onGradeChange={() => {}} // No grade changes allowed in admin view
                    />
                  ) : (
                    <p className="text-sm text-gray-500">No courses in this plan</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPlansPage; 