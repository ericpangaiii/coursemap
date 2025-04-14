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
      AND career != 'GRD'
      AND is_active = true
      AND sem_offered NOT IN ('--', '"1s,2s"')
      AND acad_group NOT IN ('GS', 'DX', 'SESAM', 'na', 'LBDBVS')
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

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;
    
    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Course ID is required' 
      });
    }

    // If updating grade, we need to update the plan_courses table
    if (updates.grade !== undefined) {
      // First, get the current user's plan
      const planQuery = `
        SELECT id FROM plans 
        WHERE user_id = $1 
        AND status = 'active'
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      const planResult = await client.query(planQuery, [req.user.id]);
      
      if (planResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No active plan found'
        });
      }

      const planId = planResult.rows[0].id;

      // Determine if we should update the status
      const shouldUpdateStatus = updates.grade !== '5' && 
                                updates.grade !== 'INC' && 
                                updates.grade !== 'DRP' &&
                                updates.grade !== '';

      // Update the grade and potentially status in plan_courses
      const updateQuery = `
        UPDATE plan_courses 
        SET grade = $1,
            status = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE plan_id = $2 
        AND course_id = $3
        RETURNING *
      `;

      const queryParams = [updates.grade, planId, courseId];
      // Set status to 'completed' if grade is valid, 'taken' if grade is 5.00, INC, or DRP, otherwise 'planned'
      queryParams.push(shouldUpdateStatus ? 'completed' : (updates.grade && ['5.00', 'INC', 'DRP'].includes(updates.grade) ? 'taken' : 'planned'));

      const result = await client.query(updateQuery, queryParams);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Course not found in plan'
        });
      }
      
      return res.json({
        success: true,
        data: result.rows[0]
      });
    }

    // For other updates, we can update the courses table
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });

    if (setClauses.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No updates provided'
      });
    }

    // Add courseId as the last parameter
    values.push(courseId);

    const query = `
      UPDATE courses 
      SET ${setClauses.join(', ')},
          updated_at = CURRENT_TIMESTAMP
      WHERE course_id = $${paramIndex}
      RETURNING *
    `;

    const result = await client.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update course' 
    });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.course_id,
        c.course_code,
        c.title,
        c.description,
        c.units,
        c.sem_offered,
        c.acad_group,
        CASE 
          WHEN cc.course_type = 'REQUIRED' AND c.is_academic = true THEN 'Required Academic'
          WHEN cc.course_type = 'REQUIRED' AND c.is_academic = false THEN 'Required Non-Academic'
          WHEN cc.course_type = 'ELECTIVE' AND c.title LIKE '(GE)%' THEN 'GE Elective'
          WHEN cc.course_type = 'ELECTIVE' THEN 'Elective'
          WHEN cc.course_type = 'CORE' THEN 'Core'
          WHEN cc.course_type = 'MAJOR' THEN 'Major'
          WHEN c.title LIKE '(GE)%' THEN 'GE Elective'
          ELSE 'Elective'
        END AS course_type
      FROM 
        courses c
      LEFT JOIN 
        curriculum_courses cc 
        ON c.course_id = cc.course_id AND cc.curriculum_id = 67
      WHERE 
        c.career != 'GRD'
        AND c.is_active = true
        AND c.sem_offered NOT IN ('--', '"1s,2s"')
        AND c.acad_group NOT IN ('GS', 'DX', 'SESAM', 'na', 'LBDBVS')
        AND c.units != '--'
      ORDER BY 
        c.course_code ASC
    `;

    const result = await client.query(query);
    
    // Clean up the data before sending
    const cleanedData = result.rows.map(course => {
      // Clean semester offered values
      let cleanedSemOffered = course.sem_offered;
      if (cleanedSemOffered) {
        cleanedSemOffered = cleanedSemOffered
          .replace(/"/g, '') // Remove quotes
          .replace(/\s+/g, '') // Remove spaces
          .toUpperCase() // Convert to uppercase
          .split(',') // Split into array
          .filter(sem => ['1S', '2S', 'M'].includes(sem)) // Keep only valid values
          .join(', '); // Join back with comma and space
      }

      // Clean units values
      let cleanedUnits = course.units;
      if (cleanedUnits) {
        cleanedUnits = cleanedUnits
          .replace(/\s+/g, '') // Remove spaces
          .split(',') // Split into array
          .filter(unit => unit !== '--') // Remove invalid values
          .join(', '); // Join back with comma and space
      }

      // Clean description
      let cleanedDescription = course.description;
      if (cleanedDescription === 'No Available DATA') {
        cleanedDescription = 'No description available.';
      }

      return {
        ...course,
        sem_offered: cleanedSemOffered,
        units: cleanedUnits,
        description: cleanedDescription
      };
    });
    
    res.json({
      success: true,
      data: cleanedData
    });
  } catch (error) {
    console.error('Error fetching all courses:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch courses' 
    });
  }
}; 