import client from '../database/index.js';

// Get all programs
export const getAllPrograms = async (req, res) => {
  try {
    const result = await client.query(
      'SELECT * FROM programs ORDER BY title ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAllPrograms:', error);
    res.status(500).json({ error: "Failed to fetch programs" });
  }
};

// Get a program by ID
export const getProgramById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'SELECT * FROM programs WHERE program_id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Program not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in getProgramById:', error);
    res.status(500).json({ error: "Failed to fetch program" });
  }
};

// Create a new program
export const createProgram = async (req, res) => {
  try {
    const { acronym, title, career, college, description, degree_id, max_units, is_visible, term_type_offer } = req.body;
    
    const result = await client.query(
      `INSERT INTO programs 
      (acronym, title, career, college, description, degree_id, max_units, is_visible, term_type_offer) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [acronym, title, career, college, description, degree_id, max_units, is_visible, term_type_offer]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in createProgram:', error);
    res.status(500).json({ error: "Failed to create program" });
  }
};

// Update a program
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { acronym, title, career, college, description, degree_id, max_units, is_visible, term_type_offer } = req.body;
    
    const result = await client.query(
      `UPDATE programs 
      SET acronym = $1, title = $2, career = $3, college = $4, description = $5, 
      degree_id = $6, max_units = $7, is_visible = $8, term_type_offer = $9, updated_at = CURRENT_TIMESTAMP 
      WHERE program_id = $10 
      RETURNING *`,
      [acronym, title, career, college, description, degree_id, max_units, is_visible, term_type_offer, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Program not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in updateProgram:', error);
    res.status(500).json({ error: "Failed to update program" });
  }
};

// Delete a program
export const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await client.query(
      'DELETE FROM programs WHERE program_id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Program not found" });
    }
    
    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error('Error in deleteProgram:', error);
    res.status(500).json({ error: "Failed to delete program" });
  }
};
