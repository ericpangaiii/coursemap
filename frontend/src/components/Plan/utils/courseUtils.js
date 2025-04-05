import { getCourseTypeColor } from "@/lib/utils";

export const getCourseItemClass = (course) => {
  if (course._isTypePlaceholder) {
    return 'text-gray-400 italic font-normal';
  }
  return course._isCurriculumCourse ? 'text-gray-400 italic' : 'text-gray-600';
};

export const getCourseIndicatorClass = (course, colorType) => {
  const baseColor = getCourseTypeColor(colorType);
  if (course._isCurriculumCourse) {
    // Return a more transparent version of the color
    if (baseColor.includes('bg-yellow-500')) return 'bg-yellow-200';
    if (baseColor.includes('bg-blue-500')) return 'bg-blue-200';
    if (baseColor.includes('bg-blue-300')) return 'bg-blue-100';
    if (baseColor.includes('bg-purple-500')) return 'bg-purple-200';
    if (baseColor.includes('bg-red-500')) return 'bg-red-200';
    return 'bg-gray-200';
  }
  return baseColor;
}; 