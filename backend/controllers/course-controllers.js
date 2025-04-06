import client from '../database/index.js';

// Get courses by their IDs
export const getCoursesByIds = async (req, res) => {
  try {
    const { courseIds } = req.body;
    
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Course IDs are required and must be a non-empty array' 
      });
    }

    // Create a parameterized query with placeholders for each ID
    const placeholders = courseIds.map((_, index) => `$${index + 1}`).join(',');
    const query = `
      SELECT 
        course_id,
        title,
        description,
        course_code,
        units,
        type as course_type,
        is_academic
      FROM courses 
      WHERE course_id IN (${placeholders})
    `;

    const result = await client.query(query, courseIds);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching courses by IDs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch courses' 
    });
  }
}; 