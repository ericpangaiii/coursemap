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
        background: 'rgb(220 252 231)', // bg-green-100
        color: 'rgb(22 163 74)', // text-green-600
        fontFamily: "'Poppins', sans-serif",
      },
      iconTheme: {
        primary: 'rgb(22 163 74)', // text-green-600
        secondary: 'rgb(220 252 231)', // bg-green-100
      },
    },
    error: {
      style: {
        background: 'rgb(254 226 226)', // bg-red-100
        color: 'rgb(220 38 38)', // text-red-600
        fontFamily: "'Poppins', sans-serif",
      },
      iconTheme: {
        primary: 'rgb(220 38 38)', // text-red-600
        secondary: 'rgb(254 226 226)', // bg-red-100
      },
    },
    loading: {
      style: {
        background: 'rgb(241 245 249)', // bg-slate-100
        color: 'rgb(71 85 105)', // text-slate-600
        fontFamily: "'Poppins', sans-serif",
      },
      iconTheme: {
        primary: 'rgb(71 85 105)', // text-slate-600
        secondary: 'rgb(241 245 249)', // bg-slate-100
      },
    },
  },
}; 