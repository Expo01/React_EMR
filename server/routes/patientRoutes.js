// API endpoints 

const express = require('express');
const router = express.Router();
const pool = require('../db');

// /patients
router.get('/patients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patient_info ORDER BY lname ASC');  
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).send('Database error');
  }
});

// /patients/:id
router.get('/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM patient_info WHERE patient_id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Patient not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching patient by ID:', err);
    res.status(500).send('Database error');
  }
});

// display signed therapist and date in the patients notes table
router.get('/notes/:patientId/notes', async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE patient_id = $1 ORDER BY created_at DESC',
      [patientId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// display specific note content
router.get('/notes/:noteId', async (req, res) => {
  const { noteId } = req.params;
  try {
    const result = await pool.query(`
      SELECT n.*, p.fname, p.lname, p.dob, p.phone
      FROM notes n
      JOIN patient_info p ON n.patient_id = p.patient_id
      WHERE n.note_id = $1
    `, [noteId]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Note not found' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});



// appointments for specific pt
router.get('/appointments/:patientId', async (req, res) => { 
  const { patientId } = req.params; 
  try {
    const result = await pool.query(
      'SELECT * FROM appointments WHERE patient_id = $1 ORDER BY scheduled_date, scheduled_time',
      [patientId] 
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create/save a new note
router.post('/notes', async (req, res) => {
  const { patient_id, content } = req.body;

  if (!patient_id || !content?.trim()) {
    return res.status(400).json({
      error: 'patient_id and content are required',
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO notes (patient_id, content, created_at)
      VALUES ($1, $2, NOW())
      RETURNING *
      `,
      [patient_id, content.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Get medications for one patient
router.get('/medications/:patientId', async (req, res) => {
  const { patientId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM medications
      WHERE patient_id = $1
      ORDER BY medication_name ASC
      `,
      [patientId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching medications:', err);
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

// Add one medication
router.post('/medications', async (req, res) => {
  const {
    patient_id,
    medication_name,
    strength,
    dose,
    dosage_form,
    route,
    frequency,
    instructions,
  } = req.body;

  if (!patient_id || !medication_name?.trim()) {
    return res.status(400).json({
      error: 'patient_id and medication_name are required',
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO medications (
        patient_id,
        medication_name,
        strength,
        dose,
        dosage_form,
        route,
        frequency,
        instructions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        patient_id,
        medication_name.trim(),
        strength || null,
        dose || null,
        dosage_form || null,
        route || null,
        frequency || null,
        instructions || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating medication:', err);
    res.status(500).json({ error: 'Failed to create medication' });
  }
});

// Delete one medication
router.delete('/medications/:medicationId', async (req, res) => {
  const { medicationId } = req.params;

  try {
    const result = await pool.query(
      `
      DELETE FROM medications
      WHERE medication_id = $1
      RETURNING *
      `,
      [medicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    res.json({ message: 'Medication deleted' });
  } catch (err) {
    console.error('Error deleting medication:', err);
    res.status(500).json({ error: 'Failed to delete medication' });
  }
});

module.exports = router;
