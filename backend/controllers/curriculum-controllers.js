import client from '../database/index.js';

// Get all curriculums
export const getAllCurriculums = async (req, res) => {
  try {
    const result = await client.query(
      'SELECT * FROM curriculums ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAllCurriculums:', error);
    res.status(500).json({ error: "Failed to fetch curriculums" });
  }
};

// Get a curriculum by ID
export const getCurriculumById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'SELECT * FROM curriculums WHERE curriculum_id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Curriculum not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in getCurriculumById:', error);
    res.status(500).json({ error: "Failed to fetch curriculum" });
  }
};

// Get curriculums by program ID
export const getCurriculumsByProgramId = async (req, res) => {
  try {
    const { programId } = req.params;
    const result = await client.query(
      'SELECT * FROM curriculums WHERE program_id = $1 ORDER BY name ASC',
      [programId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getCurriculumsByProgramId:', error);
    res.status(500).json({ error: "Failed to fetch curriculums for program" });
  }
};

// Get curriculum structure for a given curriculum ID
export const getCurriculumStructure = async (req, res) => {
  try {
    const { curriculumId } = req.params;
    
    // Get all curriculum structure entries for this curriculum
    const result = await client.query(
      `SELECT * FROM curriculum_structures 
       WHERE curriculum_id = $1
       ORDER BY year, sem`,
      [curriculumId]
    );
    
    // Get the curriculum details for the given ID
    const curriculumResult = await client.query(
      'SELECT * FROM curriculums WHERE curriculum_id = $1',
      [curriculumId]
    );
    
    if (curriculumResult.rows.length === 0) {
      return res.status(404).json({ error: "Curriculum not found" });
    }
    
    // Calculate totals across all years and semesters
    const totals = {
      major_units: 0,
      ge_elective_units: 0,
      required_units: 0,
      elective_units: 0,
      cognate_units: 0,
      specialized_units: 0,
      track_units: 0,
      total_units: 0,
      major_count: 0,
      ge_elective_count: 0,
      required_count: 0,
      elective_count: 0,
      cognate_count: 0,
      specialized_count: 0,
      track_count: 0,
      total_count: 0
    };
    
    // Sum up the totals
    result.rows.forEach(row => {
      Object.keys(totals).forEach(key => {
        totals[key] += parseInt(row[key] || 0);
      });
    });
    
    res.json({
      curriculum: curriculumResult.rows[0],
      structures: result.rows,
      totals
    });
  } catch (error) {
    console.error('Error in getCurriculumStructure:', error);
    res.status(500).json({ error: "Failed to fetch curriculum structure" });
  }
};

// Get curriculum structure for the current user's curriculum
export const getCurrentUserCurriculumStructure = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Get the user's curriculum ID
    const { curriculum_id } = req.user;
    
    if (!curriculum_id) {
      return res.status(404).json({ error: "User has no curriculum selected" });
    }
    
    // Get all curriculum structure entries for this curriculum
    const result = await client.query(
      `SELECT * FROM curriculum_structures 
       WHERE curriculum_id = $1
       ORDER BY year, sem`,
      [curriculum_id]
    );
    
    // Get the curriculum details
    const curriculumResult = await client.query(
      'SELECT * FROM curriculums WHERE curriculum_id = $1',
      [curriculum_id]
    );
    
    // Fetch the course data to count required academic vs non-academic courses
    const coursesResult = await client.query(
      `SELECT 
          c.*, 
          c.units,
          cc.course_type,
          cc.year,
          cc.sem,
          COALESCE(c.is_academic, true) as is_academic
       FROM courses c
       JOIN curriculum_courses cc ON c.course_id = cc.course_id
       JOIN curriculums cu ON cc.curriculum_id = cu.curriculum_id
       WHERE cu.curriculum_id = $1`,
      [curriculum_id]
    );
    
    // Count required academic and non-academic courses
    const requiredAcademicCount = coursesResult.rows.filter(course => 
      course.is_academic !== false
    ).length;
    
    const requiredNonAcademicCount = coursesResult.rows.filter(course => 
      course.is_academic === false
    ).length;
    
    // Calculate totals across all years and semesters
    const totals = {
      major_units: 0,
      ge_elective_units: 0,
      required_units: 0,
      elective_units: 0,
      cognate_units: 0,
      specialized_units: 0,
      track_units: 0,
      total_units: 0,
      major_count: 0,
      ge_elective_count: 0,
      required_count: 0,
      elective_count: 0,
      cognate_count: 0,
      specialized_count: 0,
      track_count: 0,
      total_count: 0
    };
    
    // Sum up the totals
    result.rows.forEach(row => {
      Object.keys(totals).forEach(key => {
        totals[key] += parseInt(row[key] || 0);
      });
    });
    
    // Add required academic and non-academic counts
    totals.required_academic_count = requiredAcademicCount;
    totals.required_non_academic_count = requiredNonAcademicCount;
    
    // Make sure required_count is the sum of both academic and non-academic
    totals.required_count = requiredAcademicCount + requiredNonAcademicCount;
    
    // Filter out fields with zero values
    const filteredTotals = {};
    Object.entries(totals).forEach(([key, value]) => {
      if (value > 0) {
        filteredTotals[key] = value;
      }
    });
    
    res.json({
      curriculum: curriculumResult.rows[0] || null,
      structures: result.rows,
      totals: filteredTotals
    });
  } catch (error) {
    console.error('Error in getCurrentUserCurriculumStructure:', error);
    res.status(500).json({ error: "Failed to fetch curriculum structure" });
  }
};

// Get curriculum courses for the current user's curriculum
export const getCurrentUserCurriculumCourses = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Get the user's curriculum ID
    const { curriculum_id } = req.user;
    
    if (!curriculum_id) {
      return res.status(404).json({ error: "User has no curriculum selected" });
    }
    
    // Get all curriculum courses using the provided query
    const result = await client.query(
      `SELECT 
          c.*, 
          cc.id as "curriculum_course_id",
          cc.course_type,
          cc.year,
          cc.sem
       FROM courses c
       JOIN curriculum_courses cc ON c.course_id = cc.course_id
       JOIN curriculums cu ON cc.curriculum_id = cu.curriculum_id
       WHERE cu.curriculum_id = $1`,
      [curriculum_id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getCurrentUserCurriculumCourses:', error);
    res.status(500).json({ error: "Failed to fetch curriculum courses" });
  }
};

// Get course type counts from curriculum structures
export const getCurriculumCourseTypeCounts = async (req, res) => {
  try {
    const { curriculumId } = req.params;
    
    // Get all curriculum structure entries for this curriculum
    const result = await client.query(
      `SELECT 
        year,
        sem,
        major_count,
        ge_elective_count,
        required_count,
        elective_count,
        cognate_count,
        specialized_count,
        track_count,
        total_count
       FROM curriculum_structures 
       WHERE curriculum_id = $1
       ORDER BY year, sem`,
      [curriculumId]
    );

    // Calculate totals for each course type
    const totals = {
      major: 0,
      ge_elective: 0,
      required: 0,
      elective: 0,
      cognate: 0,
      specialized: 0,
      track: 0,
      total: 0
    };

    // Get semesters where each course type is required
    const courseTypeSemesters = {
      major: [],
      ge_elective: [],
      required: [],
      elective: [],
      cognate: [],
      specialized: [],
      track: []
    };

    result.rows.forEach(row => {
      // Add to totals
      totals.major += row.major_count;
      totals.ge_elective += row.ge_elective_count;
      totals.required += row.required_count;
      totals.elective += row.elective_count;
      totals.cognate += row.cognate_count;
      totals.specialized += row.specialized_count;
      totals.track += row.track_count;
      totals.total += row.total_count;

      // Add to semesters if count > 0
      if (row.major_count > 0) {
        courseTypeSemesters.major.push({ year: row.year, sem: row.sem, count: row.major_count });
      }
      if (row.ge_elective_count > 0) {
        courseTypeSemesters.ge_elective.push({ year: row.year, sem: row.sem, count: row.ge_elective_count });
      }
      if (row.required_count > 0) {
        courseTypeSemesters.required.push({ year: row.year, sem: row.sem, count: row.required_count });
      }
      if (row.elective_count > 0) {
        courseTypeSemesters.elective.push({ year: row.year, sem: row.sem, count: row.elective_count });
      }
      if (row.cognate_count > 0) {
        courseTypeSemesters.cognate.push({ year: row.year, sem: row.sem, count: row.cognate_count });
      }
      if (row.specialized_count > 0) {
        courseTypeSemesters.specialized.push({ year: row.year, sem: row.sem, count: row.specialized_count });
      }
      if (row.track_count > 0) {
        courseTypeSemesters.track.push({ year: row.year, sem: row.sem, count: row.track_count });
      }
    });

    res.json({
      totals,
      courseTypeSemesters
    });
  } catch (error) {
    console.error('Error in getCurriculumCourseTypeCounts:', error);
    res.status(500).json({ error: "Failed to fetch curriculum course type counts" });
  }
};