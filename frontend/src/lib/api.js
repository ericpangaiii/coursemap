import { API_BASE_URL } from '@/lib/config';

// Authentication API calls
export const authAPI = {
  // Get authentication status
  getAuthStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        method: 'GET',
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      console.error('Authentication check failed:', error);
      return { authenticated: false };
    }
  },

  // Logout the user
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error: 'Failed to logout' };
    }
  },

  // Get Google authentication URL
  getGoogleAuthUrl: () => {
    return `${API_BASE_URL}/auth/google`;
  },

  // Update user's program
  updateProgram: async (programId, curriculumId = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/update-program`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ programId, curriculumId }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating program:', error);
      return { success: false, error: 'Failed to update program' };
    }
  }
};

// Programs API calls
export const programsAPI = {
  // Get all programs
  getAllPrograms: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/programs`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching programs:', error);
      // Return dummy data as fallback
      return [
        { program_id: '1', acronym: 'BSCS', title: 'BS Computer Science' },
        { program_id: '2', acronym: 'BSIT', title: 'BS Information Technology' },
        { program_id: '3', acronym: 'BSCS-ST', title: 'BS Computer Science - Software Technology' },
        { program_id: '4', acronym: 'BBA', title: 'Business Administration' },
        { program_id: '5', acronym: 'BSPSY', title: 'Psychology' }
      ];
    }
  },

  // Get program by ID
  getProgramById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/programs/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch program');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching program with ID ${id}:`, error);
      return null;
    }
  }
};

// Curriculums API calls
export const curriculumsAPI = {
  // Get all curriculums
  getAllCurriculums: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/curriculums`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch curriculums');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching curriculums:', error);
      return [];
    }
  },

  // Get curriculum by ID
  getCurriculumById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/curriculums/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch curriculum');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching curriculum with ID ${id}:`, error);
      return null;
    }
  },

  // Get curriculums by program ID
  getCurriculumsByProgramId: async (programId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/programs/${programId}/curriculums`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch curriculums for program');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching curriculums for program ${programId}:`, error);
      return [];
    }
  },

  // Get curriculum structure for a specific curriculum
  getCurriculumStructure: async (curriculumId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/curriculums/${curriculumId}/structure`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch curriculum structure');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching curriculum structure:`, error);
      return null;
    }
  },
  
  // Get current user's curriculum structure
  getCurrentCurriculumStructure: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my/curriculum/structure`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No curriculum selected
        }
        throw new Error('Failed to fetch curriculum structure');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching current curriculum structure:', error);
      return null;
    }
  },
  
  // Get courses for the current user's curriculum
  getCurrentCurriculumCourses: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my/curriculum/courses`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return []; // No curriculum selected
        }
        throw new Error('Failed to fetch curriculum courses');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching current curriculum courses:', error);
      return [];
    }
  },
};

// Plans API calls
export const plansAPI = {
  // Get current user's plan
  getCurrentPlan: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/my/plan`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Plan not found
        }
        throw new Error('Failed to fetch plan');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching current plan:', error);
      return null;
    }
  },

  // Create a new plan
  createPlan: async (curriculumId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          curriculumId 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create plan');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating plan:', error);
      return null;
    }
  },

  // Add a course to the plan
  addCourseToPlan: async (planId, courseId, year, semester, status = 'planned') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plans/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          planId, 
          courseId, 
          year, 
          semester, 
          status 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add course to plan');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding course to plan:', error);
      return null;
    }
  },

  // Update a course in the plan
  updatePlanCourse: async (id, year, semester, status, grade) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plans/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          year, 
          semester, 
          status, 
          grade 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update plan course');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating plan course:', error);
      return null;
    }
  },

  // Delete a course from the plan
  deletePlanCourse: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plans/courses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete plan course');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting plan course:', error);
      return null;
    }
  }
};

// Users API calls
export const usersAPI = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      return null;
    }
  }
};

// Course API calls
export const coursesAPI = {
  // Get courses by their IDs
  getCoursesByIds: async (courseIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ courseIds }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      return { success: false, error: 'Failed to fetch courses' };
    }
  },

  // Update course
  updateCourse: async (courseId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update course:', error);
      return { success: false, error: 'Failed to update course' };
    }
  },
}; 