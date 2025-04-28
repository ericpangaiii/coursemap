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
            status = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;

      const queryParams = [
        updates.grade,
        shouldUpdateStatus ? 'completed' : (updates.grade && ['5.00', 'INC', 'DRP'].includes(updates.grade) ? 'taken' : 'planned'),
        updates.plan_course_id
      ];

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
    // Get the current user's curriculum ID
    const { curriculum_id } = req.user;
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get search and filter parameters
    const searchQuery = req.query.search || '';
    const filters = {
      type: req.query.type ? req.query.type.split(',') : [],
      semOffered: req.query.semOffered ? req.query.semOffered.split(',') : [],
      acadGroup: req.query.acadGroup ? req.query.acadGroup.split(',') : [],
      units: req.query.units ? req.query.units.split(',') : [],
      whenTaken: req.query.whenTaken ? req.query.whenTaken.split(',') : []
    };
    const sortKey = req.query.sortKey || 'course_code';
    const sortDirection = req.query.sortDirection || 'ascending';

    // First, fetch all courses with basic filtering
    const query = `
      SELECT 
        c.course_id,
        c.course_code,
        c.title,
        c.description,
        c.units,
        c.sem_offered,
        c.acad_group,
        c.is_academic,
        CASE 
          WHEN cc.course_type = 'REQUIRED' AND c.is_academic = true THEN 'Required Academic'
          WHEN cc.course_type = 'REQUIRED' AND c.is_academic = false THEN 'Required Non-Academic'
          WHEN cc.course_type = 'ELECTIVE' AND c.title LIKE '(GE)%' THEN 'GE Elective'
          WHEN cc.course_type = 'ELECTIVE' THEN 'Elective'
          WHEN cc.course_type = 'CORE' THEN 'Core'
          WHEN cc.course_type = 'MAJOR' THEN 'Major'
          WHEN cc.course_type = 'COGNATE' THEN 'Cognate'
          WHEN cc.course_type = 'SPECIALIZED' THEN 'Specialized'
          WHEN cc.course_type = 'FOUNDATION' THEN 'Foundation'
          WHEN c.title LIKE '(GE)%' THEN 'GE Elective'
          ELSE 'Elective'
        END AS course_type
      FROM 
        courses c
      LEFT JOIN 
        curriculum_courses cc 
        ON c.course_id = cc.course_id AND cc.curriculum_id = $1
      WHERE 
        c.career != 'GRD'
        AND c.is_active = true
        AND c.sem_offered NOT IN ('--', '"1s,2s"')
        AND c.acad_group NOT IN ('GS', 'DX', 'SESAM', 'na', 'LBDBVS')
        AND c.units != '--'
    `;

    const result = await client.query(query, [curriculum_id]);
    let filteredCourses = result.rows;

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredCourses = filteredCourses.filter(course => 
        course.course_code.toLowerCase().includes(searchLower) ||
        course.title.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (filters.type.length > 0) {
      filteredCourses = filteredCourses.filter(course => {
        // Handle Required Academic and Non-Academic
        if (filters.type.includes('REQUIRED_ACADEMIC')) {
          return course.course_type === 'Required Academic';
        }
        if (filters.type.includes('REQUIRED_NON_ACADEMIC')) {
          return course.course_type === 'Required Non-Academic';
        }

        // Handle GE Elective
        if (filters.type.includes('GE ELECTIVE')) {
          return course.course_type === 'GE Elective';
        }

        // Handle Elective
        if (filters.type.includes('ELECTIVE')) {
          return course.course_type === 'Elective';
        }

        // Handle Major
        if (filters.type.includes('MAJOR')) {
          return course.course_type === 'Major';
        }

        // Handle other types
        return filters.type.includes(course.course_type);
      });
    }

    // Apply semester offered filter
    if (filters.semOffered.length > 0) {
      filteredCourses = filteredCourses.filter(course => {
        if (!course.sem_offered) return false;
        
        // Clean and split the semester offered string
        const offeredSems = course.sem_offered
          .replace(/"/g, '')
          .replace(/\s+/g, '')
          .toUpperCase()
          .split(',')
          .filter(sem => ['1S', '2S', 'M'].includes(sem));

        // If no valid semesters, exclude the course
        if (offeredSems.length === 0) return false;

        // Check if the course is offered exclusively during the selected semester(s)
        return filters.semOffered.every(sem => 
          offeredSems.includes(sem.toUpperCase())
        ) && offeredSems.length === filters.semOffered.length;
      });
    }

    // Apply academic group filter
    if (filters.acadGroup.length > 0) {
      filteredCourses = filteredCourses.filter(course => 
        filters.acadGroup.includes(course.acad_group)
      );
    }

    // Apply units filter
    if (filters.units.length > 0) {
      filteredCourses = filteredCourses.filter(course => 
        filters.units.includes(course.units)
      );
    }

    // Apply sorting
    if (sortKey) {
      filteredCourses.sort((a, b) => {
        let aValue = a[sortKey];
        let bValue = b[sortKey];

        // Handle special cases for sorting
        if (sortKey === 'course_code') {
          // Extract numeric and non-numeric parts for proper sorting
          const aMatch = aValue.match(/(\d+)(.*)/);
          const bMatch = bValue.match(/(\d+)(.*)/);
          
          if (aMatch && bMatch) {
            const aNum = parseInt(aMatch[1]);
            const bNum = parseInt(bMatch[1]);
            if (aNum !== bNum) {
              return sortDirection === 'ascending' ? aNum - bNum : bNum - aNum;
            }
            // If numbers are equal, sort by the remaining part
            aValue = aMatch[2];
            bValue = bMatch[2];
          }
        }

        if (aValue < bValue) return sortDirection === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    const total = filteredCourses.length;
    const paginatedCourses = filteredCourses.slice(offset, offset + limit);

    // Clean up the data before sending
    const cleanedData = paginatedCourses.map(course => {
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
      data: cleanedData,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching all courses:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch courses' 
    });
  }
}; 