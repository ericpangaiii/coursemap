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
  updateProgram: async (programId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/update-program`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ programId }),
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