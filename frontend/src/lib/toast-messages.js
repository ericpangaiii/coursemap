// Auth-related toast messages
export const authToasts = {
  signingIn: 'Redirecting to Google...',
  signInSuccess: 'Successfully signed in!',
  signInError: 'Failed to connect to authentication service. Please try again.',
  signInInvalidCredentials: 'Invalid email or password. Please try again.',
  signInServerError: 'Server error occurred. Please try again later.',
  signInNetworkError: 'Network error. Please check your connection.',
  signOutSuccess: 'Successfully signed out!',
  signOutError: 'Failed to sign out. Please try again.',
  invalidEmail: 'Please use your UP Mail account to sign in.',
  accountCreated: 'Account created successfully!',
  accountCreationError: 'Failed to create account. Please try again.',
  accountCreationEmailExists: 'An account with this email already exists.',
  accountCreationInvalidData: 'Please check your input data and try again.',
  accountCreationServerError: 'Server error occurred. Please try again later.',
  accountSetupComplete: 'Account setup complete! Welcome to your dashboard.',
};

// Program-related toast messages
export const programToasts = {
  updateSuccess: 'Program updated successfully!',
  updateError: 'Failed to update program. Please try again.',
};

// Course-related toast messages
export const courseToasts = {
  updateSuccess: 'Course updated successfully!',
  updateError: 'Failed to update course. Please try again.',
};

// Plan-related toast messages
export const planToasts = {
  createSuccess: 'Plan created successfully!',
  createError: 'Failed to create plan. Please try again.',
  createLoading: 'Creating your plan...',
  exportSuccess: 'PDF exported successfully!',
  exportError: 'Failed to export PDF. Please try again.',
};

// Grade-related toast messages
export const gradeToasts = {
  updateSuccess: 'Grade updated successfully!',
  updateError: 'Failed to update grade. Please try again.',
  updateLoading: 'Updating grade...',
}; 