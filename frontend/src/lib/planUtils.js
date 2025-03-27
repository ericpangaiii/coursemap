import { curriculumsAPI } from './api';
import { standardizeCourseType, groupCoursesByType } from './utils';

/**
 * Fetches course data for the plan creation process
 * @returns {Promise<Object>} Course data organized by type
 */
export const fetchCoursesForPlanCreation = async () => {
  try {
    console.log('Fetching courses for plan creation...');
    
    // Get curriculum courses
    const allCourses = await curriculumsAPI.getCurrentCurriculumCourses();
    console.log('Raw courses data:', allCourses);
    
    // Get curriculum structure (required counts)
    const curriculumStructure = await curriculumsAPI.getCurrentCurriculumStructure();
    console.log('Curriculum structure:', curriculumStructure);
    
    // Group courses by course type using utility function
    const coursesByType = groupCoursesByType(allCourses);
    
    // Get required counts from curriculum structure
    const requiredCounts = {
      required: curriculumStructure?.totals?.required_count || 0,
      ge_elective: curriculumStructure?.totals?.ge_elective_count || 0,
      elective: curriculumStructure?.totals?.elective_count || 0,
      major: curriculumStructure?.totals?.major_count || 0,
    };
    
    console.log('Required counts:', requiredCounts);
    console.log('Courses by type:', coursesByType);
    
    return {
      coursesByType,
      requiredCounts
    };
  } catch (error) {
    console.error('Error fetching courses for plan creation:', error);
    throw error;
  }
}; 