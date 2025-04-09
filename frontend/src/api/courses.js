import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const updateCourseGrade = async (courseId, grade) => {
  try {
    const response = await axios.put(`${API_URL}/courses/${courseId}/grade`, { grade });
    return response.data;
  } catch (error) {
    console.error('Error updating course grade:', error);
    throw error;
  }
}; 