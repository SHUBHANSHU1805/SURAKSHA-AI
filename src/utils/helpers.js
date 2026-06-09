/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate days ago
 */
export const daysAgo = (date) => {
  const days = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

/**
 * Get severity badge color
 */
export const getSeverityColor = (severity) => {
  const colors = {
    'Critical': { bg: 'bg-red-100', text: 'text-red-700', dark: 'dark:bg-red-900/20 dark:text-red-400' },
    'High': { bg: 'bg-orange-100', text: 'text-orange-700', dark: 'dark:bg-orange-900/20 dark:text-orange-400' },
    'Medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', dark: 'dark:bg-yellow-900/20 dark:text-yellow-400' },
    'Low': { bg: 'bg-green-100', text: 'text-green-700', dark: 'dark:bg-green-900/20 dark:text-green-400' }
  };
  return colors[severity] || colors['Low'];
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    'Reported': { bg: 'bg-blue-100', text: 'text-blue-700', dark: 'dark:bg-blue-900/20 dark:text-blue-400' },
    'Under Investigation': { bg: 'bg-purple-100', text: 'text-purple-700', dark: 'dark:bg-purple-900/20 dark:text-purple-400' },
    'Resolved': { bg: 'bg-green-100', text: 'text-green-700', dark: 'dark:bg-green-900/20 dark:text-green-400' },
    'Closed': { bg: 'bg-gray-100', text: 'text-gray-700', dark: 'dark:bg-gray-700 dark:text-gray-300' }
  };
  return colors[status] || colors['Reported'];
};

/**
 * Debounce function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function (...args) {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if ((Date.now() - lastRan) >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

/**
 * Local storage helpers
 */
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Copy to clipboard error:', error);
    return false;
  }
};

/**
 * Calculate distance in km (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};