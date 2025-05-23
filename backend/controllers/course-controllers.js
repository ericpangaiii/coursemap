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
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
    }

    const { courseId } = req.params;
    const updates = req.body;
    
    console.log('updateCourse - Request:', {
      courseId,
      updates,
      planCourseId: updates.plan_course_id,
      user: req.user.id
    });
    
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
        console.log('updateCourse - No active plan found for user:', req.user.id);
        return res.status(404).json({
          success: false,
          error: 'No active plan found'
        });
      }

      const planId = planResult.rows[0].id;
      console.log('updateCourse - Found active plan:', { planId });

      // Determine if we should update the status
      const shouldUpdateStatus = updates.grade !== '5.00' && 
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

      console.log('updateCourse - Executing update query:', {
        query: updateQuery,
        params: queryParams
      });

      const result = await client.query(updateQuery, queryParams);
      
      if (result.rows.length === 0) {
        console.log('updateCourse - Course not found in plan:', { planCourseId: updates.plan_course_id });
        return res.status(404).json({
          success: false,
          error: 'Course not found in plan'
        });
      }
      
      console.log('updateCourse - Successfully updated course:', {
        planCourseId: updates.plan_course_id,
        newGrade: updates.grade,
        updatedCourse: result.rows[0]
      });
      
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
      whenTaken: req.query.whenTaken ? req.query.whenTaken.split(',') : [],
      requisites: req.query.requisites ? req.query.requisites.split(',') : []
    };
    const sortKey = req.query.sortKey || 'course_code';
    const sortDirection = req.query.sortDirection || 'ascending';

    // First, fetch all courses with basic filtering
    const query = `
      SELECT 
        c.course_id,
        c.course_code,
        CASE 
          WHEN c.title LIKE '(GE)%' THEN REPLACE(REPLACE(c.title, '(GE). ', ''), '(GE) ', '')
          ELSE c.title
        END as title,
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
        END AS course_type,
        CASE 
          WHEN COALESCE(string_agg(r.req_courses, ', ' ORDER BY r.req_type), '') = '' 
              OR TRIM(string_agg(r.req_courses, ', ' ORDER BY r.req_type)) = '-' THEN 'None'
          ELSE string_agg(REPLACE(REPLACE(r.req_courses, '(', ''), ')', ''), ', ' ORDER BY r.req_type)
        END AS requisites,
        CASE 
          WHEN COALESCE(string_agg(
            CASE 
              WHEN r.req_type = 'PRE' THEN 'Prerequisite'
              WHEN r.req_type = 'CO' THEN 'Corequisite'
              ELSE r.req_type
            END, ', ' ORDER BY r.req_type), '') = ''
              OR TRIM(string_agg(r.req_type, ', ' ORDER BY r.req_type)) = '-' THEN 'None'
          ELSE string_agg(
            CASE 
              WHEN r.req_type = 'PRE' THEN 'Prerequisite'
              WHEN r.req_type = 'CO' THEN 'Corequisite'
              ELSE r.req_type
            END, ', ' ORDER BY r.req_type)
        END AS requisite_types,
        CASE 
          WHEN COALESCE(string_agg(r.course_id_req, ', ' ORDER BY r.req_type), '') = ''
              OR TRIM(string_agg(r.course_id_req, ', ' ORDER BY r.req_type)) = '-' THEN 'None'
          ELSE string_agg(r.course_id_req, ', ' ORDER BY r.req_type)
        END AS requisite_course_ids
      FROM 
        courses c
      LEFT JOIN 
        curriculum_courses cc 
        ON c.course_id = cc.course_id AND cc.curriculum_id = $1
      LEFT JOIN 
        requisites r
        ON c.course_id = r.course_id AND r.is_active = true
      WHERE 
        c.career != 'GRD'
        AND c.sem_offered NOT IN ('--', '"1s,2s"')
        AND c.acad_group NOT IN ('GS', 'DX', 'SESAM', 'na', 'LBDBVS')
        AND c.units != '--'
        AND (c.is_active = true OR cc.course_id IS NOT NULL)
      GROUP BY
        c.course_id, c.course_code, c.title, c.description, c.units,
        c.sem_offered, c.acad_group, c.is_academic, c.is_repeatable,
        cc.course_type, cc.year, cc.sem, cc.id
      ORDER BY c.course_code ASC
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

    // Apply requisites filter
    if (filters.requisites.includes('NONE')) {
      filteredCourses = filteredCourses.filter(course => {
        // Check if the course has no prerequisites or corequisites
        return course.requisites === 'None';
      });
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

// Get courses for plan creation modal
export const getCoursesForPlanCreation = async (req, res) => {
  try {
    // Get the current user's curriculum ID
    const { curriculum_id } = req.user;
    
    if (!curriculum_id) {
      return res.status(400).json({
        success: false,
        error: 'No curriculum selected'
      });
    }

    // First query to get courses with cleared year/sem for certain types
    const coursesQuery = `
      WITH combined_courses AS (
        SELECT 
          c.course_id,
          CASE 
            WHEN c.course_code IN ('HIST 1', 'KAS 1') THEN 'HIST 1 / KAS 1'
            ELSE c.course_code
          END as course_code,
          CASE 
            WHEN c.course_code IN ('HIST 1', 'KAS 1') THEN 'Philippine History / Kasaysayan ng Pilipinas'
            ELSE c.title
          END as title,
          c.description,
          CASE 
            WHEN (c.title = 'Special Problems' OR c.title = 'Undergraduate Thesis' OR c.title = 'Undergraduate Thesis in Biology')
            AND ROW_NUMBER() OVER (PARTITION BY c.course_code ORDER BY cc.id) = 1 THEN '1'
            WHEN (c.title = 'Special Problems' OR c.title = 'Undergraduate Thesis' OR c.title = 'Undergraduate Thesis in Biology')
            AND ROW_NUMBER() OVER (PARTITION BY c.course_code ORDER BY cc.id) = 2 THEN '2'
            WHEN (c.title = 'Special Problems' OR c.title = 'Undergraduate Thesis' OR c.title = 'Undergraduate Thesis in Biology')
            AND c.units LIKE '%,%' THEN '3'
            ELSE c.units
          END as units,
          c.sem_offered,
          c.acad_group,
          c.is_academic,
          c.is_repeatable,
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
          END AS course_type,
          CASE 
            WHEN cc.course_type IN ('ELECTIVE', 'CORE', 'MAJOR', 'COGNATE', 'SPECIALIZED', 'FOUNDATION') 
              OR (cc.course_type = 'ELECTIVE' AND c.title LIKE '(GE)%')
            THEN NULL
            ELSE cc.year
          END as year,
          CASE 
            WHEN cc.course_type IN ('ELECTIVE', 'CORE', 'MAJOR', 'COGNATE', 'SPECIALIZED', 'FOUNDATION') 
              OR (cc.course_type = 'ELECTIVE' AND c.title LIKE '(GE)%')
            THEN NULL
            ELSE cc.sem
          END as sem,
          CASE 
            WHEN COALESCE(string_agg(r.req_courses, ', ' ORDER BY r.req_type), '') = '' 
                OR TRIM(string_agg(r.req_courses, ', ' ORDER BY r.req_type)) = '-' THEN 'None'
            ELSE string_agg(REPLACE(REPLACE(r.req_courses, '(', ''), ')', ''), ', ' ORDER BY r.req_type)
          END AS requisites,
          CASE 
            WHEN COALESCE(string_agg(
              CASE 
                WHEN r.req_type = 'PRE' THEN 'Prerequisite'
                WHEN r.req_type = 'CO' THEN 'Corequisite'
                ELSE r.req_type
              END, ', ' ORDER BY r.req_type), '') = ''
                OR TRIM(string_agg(r.req_type, ', ' ORDER BY r.req_type)) = '-' THEN 'None'
            ELSE string_agg(
              CASE 
                WHEN r.req_type = 'PRE' THEN 'Prerequisite'
                WHEN r.req_type = 'CO' THEN 'Corequisite'
                ELSE r.req_type
              END, ', ' ORDER BY r.req_type)
          END AS requisite_types,
          CASE 
            WHEN COALESCE(string_agg(r.course_id_req, ', ' ORDER BY r.req_type), '') = ''
                OR TRIM(string_agg(r.course_id_req, ', ' ORDER BY r.req_type)) = '-' THEN 'None'
            ELSE string_agg(r.course_id_req, ', ' ORDER BY r.req_type)
          END AS requisite_course_ids,
          cc.id as curriculum_course_id,
          ROW_NUMBER() OVER (PARTITION BY c.course_code ORDER BY cc.id) as course_occurrence
        FROM 
          courses c
        LEFT JOIN 
          curriculum_courses cc 
          ON c.course_id = cc.course_id AND cc.curriculum_id = $1
        LEFT JOIN 
          requisites r
          ON c.course_id = r.course_id AND r.is_active = true
        WHERE 
          c.career != 'GRD'
          AND c.sem_offered NOT IN ('--', '"1s,2s"')
          AND c.acad_group NOT IN ('GS', 'DX', 'SESAM', 'na', 'LBDBVS')
          AND c.units != '--'
        GROUP BY
          c.course_id, c.course_code, c.title, c.description, c.units,
          c.sem_offered, c.acad_group, c.is_academic, c.is_repeatable,
          cc.course_type, cc.year, cc.sem, cc.id
      )
      SELECT *
      FROM (
        SELECT DISTINCT ON (course_code) *
        FROM combined_courses
        WHERE course_code = 'HIST 1 / KAS 1'
        ORDER BY course_code, course_id
      ) hist_kas
      UNION ALL
      SELECT *
      FROM combined_courses
      WHERE course_code != 'HIST 1 / KAS 1';
    `;

    // Second query to get prescribed semesters from curriculum_structures
    const prescribedSemestersQuery = `
      SELECT 
        'GE Elective' as course_type,
        year,
        sem
      FROM curriculum_structures
      WHERE curriculum_id = $1 AND ge_elective_count > 0
      UNION ALL
      SELECT 
        'Elective' as course_type,
        year,
        sem
      FROM curriculum_structures
      WHERE curriculum_id = $1 AND elective_count > 0
      UNION ALL
      SELECT 
        'Major' as course_type,
        year,
        sem
      FROM curriculum_structures
      WHERE curriculum_id = $1 AND major_count > 0
      UNION ALL
      SELECT 
        'Cognate' as course_type,
        year,
        sem
      FROM curriculum_structures
      WHERE curriculum_id = $1 AND cognate_count > 0
      UNION ALL
      SELECT 
        'Specialized' as course_type,
        year,
        sem
      FROM curriculum_structures
      WHERE curriculum_id = $1 AND specialized_count > 0
      UNION ALL
      SELECT 
        'Foundation' as course_type,
        year,
        sem
      FROM curriculum_structures
      WHERE curriculum_id = $1 AND track_count > 0
      ORDER BY course_type, year, sem;
    `;

    const [coursesResult, prescribedSemestersResult] = await Promise.all([
      client.query(coursesQuery, [curriculum_id]),
      client.query(prescribedSemestersQuery, [curriculum_id])
    ]);

    // Create a map of course types to their prescribed semesters
    const prescribedSemestersMap = prescribedSemestersResult.rows.reduce((acc, row) => {
      if (!acc[row.course_type]) {
        acc[row.course_type] = [];
      }
      acc[row.course_type].push({ year: row.year, sem: row.sem });
      return acc;
    }, {});

    // Clean up the data and apply prescribed semesters
    const cleanedData = coursesResult.rows.map(course => {
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

      // Handle special cases for Special Problems and Undergraduate Thesis
      let cleanedUnits = course.units;
      if (cleanedUnits) {
        const isSpecialCourse = course.title === 'Special Problems' || course.title === 'Undergraduate Thesis' || course.title === 'Undergraduate Thesis in Biology';
        
        if (isSpecialCourse) {
          // If the course appears multiple times in the curriculum
          if (course.course_occurrence === 1) {
            cleanedUnits = '1';
          } else if (course.course_occurrence === 2) {
            cleanedUnits = '2';
          } else {
            // For any other occurrence, set to 3 units if multiple units are available
            const unitValues = cleanedUnits.split(',').map(u => u.trim());
            if (unitValues.length > 1) {
              cleanedUnits = '3';
            }
          }
        } else {
          // For non-special courses, clean units normally
          cleanedUnits = cleanedUnits
            .replace(/\s+/g, '') // Remove spaces
            .split(',') // Split into array
            .filter(unit => unit !== '--') // Remove invalid values
            .join(', '); // Join back with comma and space
        }
      }

      // Clean description
      let cleanedDescription = course.description;
      if (cleanedDescription === 'No Available DATA') {
        cleanedDescription = 'No description available.';
      }

      // Apply prescribed semesters based on course type
      let prescribed_semesters = [];
      if (course.course_type === 'Required Academic' || course.course_type === 'Required Non-Academic') {
        // For required courses, use their fixed year/sem as the single prescribed semester
        if (course.year && course.sem) {
          prescribed_semesters = [{ year: course.year, sem: course.sem }];
        }
      } else {
        // For other course types, use the prescribed semesters from curriculum_structures
        prescribed_semesters = prescribedSemestersMap[course.course_type] || [];
      }

      return {
        ...course,
        sem_offered: cleanedSemOffered,
        units: cleanedUnits,
        description: cleanedDescription,
        year: course.year,
        sem: course.sem,
        prescribed_semesters,
        // Use curriculum_course_id as the unique identifier for repeatable courses
        id: course.is_repeatable ? course.curriculum_course_id : course.course_id
      };
    });

    res.json({
      success: true,
      data: cleanedData
    });
  } catch (error) {
    console.error('Error fetching courses for plan creation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch courses' 
    });
  }
};

// Get all courses for admin
export const getAllAdminCourses = async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get search and filter parameters
    const searchQuery = req.query.search || '';
    const filters = {
      college: req.query.college ? req.query.college.split(',') : [],
      semester: req.query.semester ? req.query.semester.split(',') : []
    };
    const sortKey = req.query.sortKey || 'course_code';
    const sortDirection = req.query.sortDirection || 'ascending';

    // Base query
    let query = `
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
          WHEN COALESCE(string_agg(r.req_courses, ', ' ORDER BY r.req_type), '') = '' 
              OR TRIM(string_agg(r.req_courses, ', ' ORDER BY r.req_type)) = '-' THEN 'None'
          ELSE string_agg(REPLACE(REPLACE(r.req_courses, '(', ''), ')', ''), ', ' ORDER BY r.req_type)
        END AS requisites,
        CASE 
          WHEN COALESCE(string_agg(
            CASE 
              WHEN r.req_type = 'PRE' THEN 'Prerequisite'
              WHEN r.req_type = 'CO' THEN 'Corequisite'
              ELSE r.req_type
            END, ', ' ORDER BY r.req_type), '') = ''
              OR TRIM(string_agg(r.req_type, ', ' ORDER BY r.req_type)) = '-' THEN 'None'
          ELSE string_agg(
            CASE 
              WHEN r.req_type = 'PRE' THEN 'Prerequisite'
              WHEN r.req_type = 'CO' THEN 'Corequisite'
              ELSE r.req_type
            END, ', ' ORDER BY r.req_type)
        END AS requisite_types
      FROM 
        courses c
      LEFT JOIN 
        requisites r
        ON c.course_id = r.course_id AND r.is_active = true
      WHERE 
        c.career != 'GRD'
        AND c.sem_offered NOT IN ('--', '"1s,2s"')
        AND c.acad_group NOT IN ('GS', 'DX', 'SESAM', 'na', 'LBDBVS')
        AND c.units != '--'
        AND c.is_active = true
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Add search condition
    if (searchQuery) {
      query += ` AND (LOWER(c.course_code) LIKE LOWER($${paramIndex}) OR LOWER(c.title) LIKE LOWER($${paramIndex}))`;
      queryParams.push(`%${searchQuery}%`);
      paramIndex++;
    }

    // Add college filter
    if (filters.college.length > 0) {
      query += ` AND c.acad_group = ANY($${paramIndex})`;
      queryParams.push(filters.college);
      paramIndex++;
    }

    // Add semester filter
    if (filters.semester.length > 0) {
      query += ` AND (
        SELECT array_length(array_agg(DISTINCT sem), 1)
        FROM unnest(string_to_array(REPLACE(REPLACE(c.sem_offered, '"', ''), ' ', ''), ',')) AS sem
        WHERE sem = ANY($${paramIndex})
      ) = array_length($${paramIndex}, 1)
        AND NOT EXISTS (
          SELECT 1
          FROM unnest(string_to_array(REPLACE(REPLACE(c.sem_offered, '"', ''), ' ', ''), ',')) AS sem
          WHERE sem != ALL($${paramIndex})
        )`;
      queryParams.push(filters.semester);
      paramIndex++;
    }

    // Add group by clause
    query += `
      GROUP BY
        c.course_id, c.course_code, c.title, c.description, c.units,
        c.sem_offered, c.acad_group, c.is_academic
    `;

    // Add sorting
    if (sortKey) {
      query += ` ORDER BY c.${sortKey} ${sortDirection === 'ascending' ? 'ASC' : 'DESC'}`;
    }

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT c.course_id) as total
      FROM courses c
      LEFT JOIN requisites r ON c.course_id = r.course_id AND r.is_active = true
      WHERE 
        c.career != 'GRD'
        AND c.sem_offered NOT IN ('--', '"1s,2s"')
        AND c.acad_group NOT IN ('GS', 'DX', 'SESAM', 'na', 'LBDBVS')
        AND c.units != '--'
    `;

    const countParams = [];
    let countParamIndex = 1;

    if (searchQuery) {
      countQuery += ` AND (LOWER(c.course_code) LIKE LOWER($${countParamIndex}) OR LOWER(c.title) LIKE LOWER($${countParamIndex}))`;
      countParams.push(`%${searchQuery}%`);
      countParamIndex++;
    }

    if (filters.college.length > 0) {
      countQuery += ` AND c.acad_group = ANY($${countParamIndex})`;
      countParams.push(filters.college);
      countParamIndex++;
    }

    if (filters.semester.length > 0) {
      countQuery += ` AND (
        SELECT array_length(array_agg(DISTINCT sem), 1)
        FROM unnest(string_to_array(REPLACE(REPLACE(c.sem_offered, '"', ''), ' ', ''), ',')) AS sem
        WHERE sem = ANY($${countParamIndex})
      ) = array_length($${countParamIndex}, 1)
        AND NOT EXISTS (
          SELECT 1
          FROM unnest(string_to_array(REPLACE(REPLACE(c.sem_offered, '"', ''), ' ', ''), ',')) AS sem
          WHERE sem != ALL($${countParamIndex})
        )`;
      countParams.push(filters.semester);
      countParamIndex++;
    }

    const [result, countResult] = await Promise.all([
      client.query(query, queryParams),
      client.query(countQuery, countParams)
    ]);

    // Clean up the data before sending
    const cleanedData = result.rows.map(course => {
      // Clean semester offered values
      let cleanedSemOffered = course.sem_offered;
      if (cleanedSemOffered) {
        cleanedSemOffered = cleanedSemOffered
          .replace(/"/g, '')
          .replace(/\s+/g, '')
          .toUpperCase()
          .split(',')
          .filter(sem => ['1S', '2S', 'M'].includes(sem))
          .join(', ');
      }

      // Clean units values
      let cleanedUnits = course.units;
      if (cleanedUnits) {
        cleanedUnits = cleanedUnits
          .replace(/\s+/g, '')
          .split(',')
          .filter(unit => unit !== '--')
          .join(', ');
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
      total: parseInt(countResult.rows[0].total),
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching admin courses:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch courses' 
    });
  }
};