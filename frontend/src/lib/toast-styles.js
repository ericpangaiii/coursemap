// Base toast styles
export const baseToastStyles = {
  style: {
    minWidth: '200px',
    maxWidth: '300px',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif",
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
};

// Toaster component configuration
export const toasterConfig = {
  position: 'top-center',
  duration: 3000,
  gutter: 8,
  containerStyle: {
    top: 20,
  },
  toastOptions: {
    // Default styles for all toasts
    ...baseToastStyles,
    // Type-specific styles
    success: {
      style: {
        background: 'var(--success-bg)',
        color: 'var(--success-text)',
        fontFamily: "'Poppins', sans-serif",
      },
      iconTheme: {
        primary: 'var(--success-text)',
        secondary: 'var(--success-bg)',
      },
    },
    error: {
      style: {
        background: 'var(--error-bg)',
        color: 'var(--error-text)',
        fontFamily: "'Poppins', sans-serif",
      },
      iconTheme: {
        primary: 'var(--error-text)',
        secondary: 'var(--error-bg)',
      },
    },
    loading: {
      style: {
        background: 'var(--loading-bg)',
        color: 'var(--loading-text)',
        fontFamily: "'Poppins', sans-serif",
      },
      iconTheme: {
        primary: 'var(--loading-text)',
        secondary: 'var(--loading-bg)',
      },
    },
  },
}; 