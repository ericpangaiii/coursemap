import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * Merges class names with Tailwind's class conflict resolution
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
