import toast from 'react-hot-toast';
import { authToasts, programToasts, courseToasts, planToasts, gradeToasts, themeToasts } from './toast-messages';

// Toast functions
export const showSuccessToast = (message) => {
  toast.success(message);
};

export const showErrorToast = (message) => {
  toast.error(message);
};

export const showLoadingToast = (message) => {
  toast.loading(message);
};

// Auth-related toast functions
export const authToastFunctions = {
  signingIn: () => showLoadingToast(authToasts.signingIn),
  signInSuccess: () => showSuccessToast(authToasts.signInSuccess),
  signInError: () => showErrorToast(authToasts.signInError),
  signOutSuccess: () => showSuccessToast(authToasts.signOutSuccess),
  signOutError: () => showErrorToast(authToasts.signOutError),
  invalidEmail: () => showErrorToast(authToasts.invalidEmail),
  accountCreated: () => showSuccessToast(authToasts.accountCreated),
  accountCreationError: () => showErrorToast(authToasts.accountCreationError),
  accountSetupComplete: () => showSuccessToast(authToasts.accountSetupComplete),
};

// Program-related toast functions
export const programToastFunctions = {
  updateSuccess: () => showSuccessToast(programToasts.updateSuccess),
  updateError: () => showErrorToast(programToasts.updateError),
};

// Course-related toast functions
export const courseToastFunctions = {
  updateSuccess: () => showSuccessToast(courseToasts.updateSuccess),
  updateError: () => showErrorToast(courseToasts.updateError),
};

// Plan-related toast functions
export const planToastFunctions = {
  createSuccess: () => showSuccessToast(planToasts.createSuccess),
  createError: () => showErrorToast(planToasts.createError),
  createLoading: () => showLoadingToast(planToasts.createLoading),
  exportSuccess: () => showSuccessToast(planToasts.exportSuccess),
  exportError: () => showErrorToast(planToasts.exportError),
};

// Grade-related toast functions
export const gradeToastFunctions = {
  updateSuccess: () => showSuccessToast(gradeToasts.updateSuccess),
  updateError: () => showErrorToast(gradeToasts.updateError),
  updateLoading: () => showLoadingToast(gradeToasts.updateLoading),
};

// Theme-related toast functions
export const themeToastFunctions = {
  lightMode: () => showSuccessToast(themeToasts.lightMode),
  darkMode: () => showSuccessToast(themeToasts.darkMode),
}; 