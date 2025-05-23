import client from '../database/index.js';

// Get a user's plan by user ID
export const getPlanByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // First, get the plan
    const planResult = await client.query(
      'SELECT * FROM plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    
    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: "Plan not found for this user" });
    }
    
    const plan = planResult.rows[0];
    
    // Then, get the courses in the plan
    const coursesResult = await client.query(
      `SELECT pc.*, c.title, c.course_code, c.units 
       FROM plan_courses pc 
       JOIN courses c ON pc.course_id = c.course_id 
       WHERE pc.plan_id = $1
       ORDER BY pc.year, pc.sem`,
      [plan.id]
    );
    
    const planWithCourses = {
      ...plan,
      courses: coursesResult.rows
    };
    
    res.json(planWithCourses);
  } catch (error) {
    console.error('Error in getPlanByUserId:', error);
    res.status(500).json({ error: "Failed to fetch plan" });
  }
};

// Create a new plan
export const createPlan = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { curriculumId } = req.body;
    const userId = req.user.id;
    
    if (!curriculumId) {
      return res.status(400).json({ error: "Curriculum ID is required" });
    }
    
    // Check if user already has a plan
    const existingPlanResult = await client.query(
      'SELECT * FROM plans WHERE user_id = $1',
      [userId]
    );
    
    if (existingPlanResult.rows.length > 0) {
      return res.status(400).json({ error: "User already has a plan" });
    }
    
    // Create new plan
    const result = await client.query(
      'INSERT INTO plans (user_id, curriculum_id) VALUES ($1, $2) RETURNING *',
      [userId, curriculumId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in createPlan:', error);
    res.status(500).json({ error: "Failed to create plan" });
  }
};

// Add a course to a plan
export const addCourseToPlan = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { planId, courseId, year, semester, status, units } = req.body;
    
    if (!planId || !courseId || !year || !semester) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify the plan belongs to the user
    const planResult = await client.query(
      'SELECT * FROM plans WHERE id = $1 AND user_id = $2',
      [planId, req.user.id]
    );

    if (planResult.rows.length === 0) {
      return res.status(403).json({ error: "Not authorized to modify this plan" });
    }

    // Add the course to the plan
    const result = await client.query(
      'INSERT INTO plan_courses (plan_id, course_id, year, sem, status, units) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [planId, courseId, year, semester, status || 'planned', units]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in addCourseToPlan:', error);
    res.status(500).json({ error: "Failed to add course to plan" });
  }
};

// Update a course in a plan
export const updatePlanCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, semester, status, grade } = req.body;
    
    // Determine if we should update the status based on grade
    const shouldUpdateStatus = grade !== '5.00' && 
                             grade !== 'INC' && 
                             grade !== 'DRP' &&
                             grade !== '';
    
    const newStatus = shouldUpdateStatus ? 'completed' : 
                     (grade && ['5.00', 'INC', 'DRP'].includes(grade) ? 'taken' : 'planned');
    
    // Update the plan course
    const result = await client.query(
      `UPDATE plan_courses 
       SET year = $1, sem = $2, status = $3, grade = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING *`,
      [year, semester, newStatus, grade, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Plan course not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in updatePlanCourse:', error);
    res.status(500).json({ error: "Failed to update plan course" });
  }
};

// Delete a course from a plan
export const deletePlanCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await client.query(
      'DELETE FROM plan_courses WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Plan course not found" });
    }
    
    res.json({ message: "Plan course deleted successfully" });
  } catch (error) {
    console.error('Error in deletePlanCourse:', error);
    res.status(500).json({ error: "Failed to delete plan course" });
  }
};

// Get current user's plan
export const getCurrentUserPlan = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Get the user's plan
    const planResult = await client.query(
      'SELECT * FROM plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    
    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }
    
    const plan = planResult.rows[0];
    
    // Get the courses in the plan, including course type from curriculum_courses
    const coursesResult = await client.query(
      `WITH ranked_curriculum_courses AS (
        SELECT *,
              ROW_NUMBER() OVER (
                PARTITION BY course_id
                ORDER BY 
                  CASE 
                    WHEN course_type = 'MAJOR' THEN 1
                    WHEN course_type = 'CORE' THEN 2
                    WHEN course_type = 'REQUIRED' THEN 3
                    WHEN course_type = 'ELECTIVE' THEN 4
                    ELSE 5
                  END
              ) AS rn
        FROM curriculum_courses
        WHERE curriculum_id = $2
      )

      SELECT 
          pc.id as plan_course_id,
          pc.plan_id,
          pc.course_id,
          pc.year,
          pc.sem,
          pc.status,
          pc.grade,
          pc.units,
          pc.created_at,
          pc.updated_at,
          c.title,
          c.course_code,
          c.description,
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
          END AS requisite_course_ids,
          cc.id as curriculum_course_id
      FROM plan_courses pc 
      JOIN courses c ON pc.course_id = c.course_id 
      LEFT JOIN ranked_curriculum_courses cc ON c.course_id = cc.course_id AND cc.rn = 1
      LEFT JOIN requisites r ON c.course_id = r.course_id AND r.is_active = true
      WHERE pc.plan_id = $1
      GROUP BY pc.id, c.course_id, c.title, c.course_code, c.description, c.units,
               c.sem_offered, c.acad_group, c.is_academic, c.is_repeatable,
               cc.course_type, cc.id
      ORDER BY pc.year, pc.sem;`,
      [plan.id, plan.curriculum_id]
    );

    // Get prescribed semesters for the curriculum
    const prescribedSemestersResult = await client.query(
      `SELECT 
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
      ORDER BY course_type, year, sem;`,
      [plan.curriculum_id]
    );

    // Create a map of course types to their prescribed semesters
    const prescribedSemestersMap = prescribedSemestersResult.rows.reduce((acc, row) => {
      if (!acc[row.course_type]) {
        acc[row.course_type] = [];
      }
      acc[row.course_type].push({ year: row.year, sem: row.sem });
      return acc;
    }, {});
    
    const planWithCourses = {
      ...plan,
      courses: coursesResult.rows.map(course => {
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
          units: course.units ? course.units.replace(/['"]/g, '').trim() : null,
          sem_offered: course.sem_offered 
            ? course.sem_offered
                .replace(/['"]/g, '') // Remove quotes
                .replace(/\s+/g, '') // Remove spaces
                .split(',') // Split into array
                .map(sem => sem.toUpperCase()) // Convert to uppercase
                .filter(sem => ['1S', '2S', 'M'].includes(sem)) // Filter valid values
                .join(', ') // Join with comma and space
            : null,
          description: course.description === 'No Available DATA' ? 'No description available.' : course.description,
          prescribed_semesters,
          // Use curriculum_course_id as the unique identifier for repeatable courses
          id: course.is_repeatable ? course.curriculum_course_id : course.course_id
        };
      })
    };
    
    res.json(planWithCourses);
  } catch (error) {
    console.error('Error in getCurrentUserPlan:', error);
    res.status(500).json({ error: "Failed to fetch plan" });
  }
};

// Get all plans for a user
export const getAllPlansByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all plans for the user
    const plansResult = await client.query(
      'SELECT * FROM plans WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    if (plansResult.rows.length === 0) {
      return res.status(404).json({ error: "No plans found for this user" });
    }
    
    // Get courses for each plan
    const plansWithCourses = await Promise.all(plansResult.rows.map(async (plan) => {
      const coursesResult = await client.query(
        `WITH ranked_curriculum_courses AS (
          SELECT *,
                ROW_NUMBER() OVER (
                  PARTITION BY course_id
                  ORDER BY 
                    CASE 
                      WHEN course_type = 'MAJOR' THEN 1
                      WHEN course_type = 'CORE' THEN 2
                      WHEN course_type = 'REQUIRED' THEN 3
                      WHEN course_type = 'ELECTIVE' THEN 4
                      ELSE 5
                    END
                ) AS rn
          FROM curriculum_courses
          WHERE curriculum_id = $2
        )
        SELECT 
          pc.*,
          c.title,
          c.course_code,
          c.description,
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
        FROM plan_courses pc 
        JOIN courses c ON pc.course_id = c.course_id 
        JOIN ranked_curriculum_courses cc ON c.course_id = cc.course_id AND cc.rn = 1
        WHERE pc.plan_id = $1
        ORDER BY pc.year, pc.sem`,
        [plan.id, plan.curriculum_id]
      );
      
      return {
        ...plan,
        courses: coursesResult.rows.map(course => ({
          ...course,
          units: course.units ? course.units.replace(/['"]/g, '').trim() : null,
          sem_offered: course.sem_offered 
            ? course.sem_offered
                .replace(/['"]/g, '') // Remove quotes
                .replace(/\s+/g, '') // Remove spaces
                .split(',') // Split into array
                .map(sem => sem.toUpperCase()) // Convert to uppercase
                .filter(sem => ['1S', '2S', 'M'].includes(sem)) // Filter valid values
                .join(', ') // Join with comma and space
            : null,
          description: course.description === 'No Available DATA' ? 'No description available.' : course.description
        }))
      };
    }));
    
    res.json(plansWithCourses);
  } catch (error) {
    console.error('Error in getAllPlansByUserId:', error);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
};

// Get all plans
export const getAllPlans = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Get all plans with user and curriculum information
    const plansResult = await client.query(`
      SELECT 
        p.id,
        p.created_at,
        p.updated_at,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as user,
        json_build_object(
          'id', c.curriculum_id,
          'name', c.name,
          'code', c.code
        ) as curriculum,
        (
          WITH ranked_curriculum_courses AS (
            SELECT *,
                  ROW_NUMBER() OVER (
                    PARTITION BY course_id
                    ORDER BY 
                      CASE 
                        WHEN course_type = 'MAJOR' THEN 1
                        WHEN course_type = 'CORE' THEN 2
                        WHEN course_type = 'REQUIRED' THEN 3
                        WHEN course_type = 'ELECTIVE' THEN 4
                        ELSE 5
                      END
                  ) AS rn
            FROM curriculum_courses
            WHERE curriculum_id = p.curriculum_id
          )
          SELECT json_agg(
            json_build_object(
              'id', pc.id,
              'course_code', co.course_code,
              'title', co.title,
              'units', co.units,
              'grade', pc.grade,
              'year', pc.year,
              'sem', pc.sem,
              'course_type', CASE
                WHEN cc.course_type = 'REQUIRED' AND co.is_academic = true THEN 'Required Academic'
                WHEN cc.course_type = 'REQUIRED' AND co.is_academic = false THEN 'Required Non-Academic'
                WHEN cc.course_type = 'ELECTIVE' AND co.title LIKE '(GE)%' THEN 'GE Elective'
                WHEN cc.course_type = 'ELECTIVE' THEN 'Elective'
                WHEN cc.course_type = 'CORE' THEN 'Core'
                WHEN cc.course_type = 'MAJOR' THEN 'Major'
                WHEN co.title LIKE '(GE)%' THEN 'GE Elective'
                ELSE 'Elective'
              END
            )
          )
          FROM plan_courses pc
          JOIN courses co ON pc.course_id = co.course_id
          JOIN ranked_curriculum_courses cc ON co.course_id = cc.course_id AND cc.rn = 1
          WHERE pc.plan_id = p.id
        ) as courses
      FROM plans p
      JOIN users u ON p.user_id = u.id
      JOIN curriculums c ON p.curriculum_id = c.curriculum_id
      ORDER BY p.created_at DESC
    `);
    
    res.json(plansResult.rows);
  } catch (error) {
    console.error('Error in getAllPlans:', error);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
}; 