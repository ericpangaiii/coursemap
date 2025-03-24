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