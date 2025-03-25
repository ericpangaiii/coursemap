import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * Merges class names with Tailwind's class conflict resolution
 * @param  {...any} inputs - Class names or conditional objects to merge
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Get initials from a name
 * @param {string} name - Name to get initials from
 * @returns {string} Initials
 */
export function getInitials(name) {
  if (!name) return "?";
  
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Format a date string
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
}
