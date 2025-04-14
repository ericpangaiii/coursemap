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
  try {
    const { planId, courseId, year, semester, status } = req.body;
    
    // Add the course to the plan
    const result = await client.query(
      'INSERT INTO plan_courses (plan_id, course_id, year, sem, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [planId, courseId, year, semester, status || 'planned']
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
    
    // Update the plan course
    const result = await client.query(
      `UPDATE plan_courses 
       SET year = $1, semester = $2, status = $3, grade = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING *`,
      [year, semester, status, grade, id]
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
          pc.*,
          c.title,
          c.course_code,
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
      FROM plan_courses pc 
      JOIN courses c ON pc.course_id = c.course_id 
      JOIN ranked_curriculum_courses cc ON c.course_id = cc.course_id AND cc.rn = 1
      WHERE pc.plan_id =$1
      ORDER BY pc.year, pc.sem;`,
      [plan.id, plan.curriculum_id]
    );
    
    const planWithCourses = {
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
    
    res.json(planWithCourses);
  } catch (error) {
    console.error('Error in getCurrentUserPlan:', error);
    res.status(500).json({ error: "Failed to fetch plan" });
  }
}; 