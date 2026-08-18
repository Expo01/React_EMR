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

// create a new note draft
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
      INSERT INTO notes (
        patient_id,
        content,
        created_at,
        is_signed
      )
      VALUES ($1, $2, NOW(), FALSE)
      RETURNING *
      `,
      [patient_id, content.trim()]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Error creating note draft:', err);
    res.status(500).json({
      error: 'Failed to create note draft',
    });
  }
});

// update an unsigned note draft
router.patch('/notes/:noteId', async (req, res) => {
  const { noteId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({
      error: 'Note content is required',
    });
  }

  try {
    // Check that the note exists and has not already been signed
    const existingNote = await pool.query(
      `
      SELECT is_signed
      FROM notes
      WHERE note_id = $1
      `,
      [noteId]
    );

    if (existingNote.rows.length === 0) {
      return res.status(404).json({
        error: 'Note not found',
      });
    }

    if (existingNote.rows[0].is_signed) {
      return res.status(409).json({
        error: 'Signed notes cannot be edited',
      });
    }

    const result = await pool.query(
      `
      UPDATE notes
      SET content = $1
      WHERE note_id = $2
      RETURNING *
      `,
      [content.trim(), noteId]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Error updating note draft:', err);
    res.status(500).json({
      error: 'Failed to update note draft',
    });
  }
});

// sign and lock a note
router.patch('/notes/:noteId/sign', async (req, res) => {
  const { noteId } = req.params;
  const { content, signed_therapist } = req.body;

  if (!content?.trim() || !signed_therapist?.trim()) {
    return res.status(400).json({
      error: 'Note content and signing clinician are required',
    });
  }

  try {
    // Check that the note exists and has not already been signed
    const existingNote = await pool.query(
      `
      SELECT is_signed
      FROM notes
      WHERE note_id = $1
      `,
      [noteId]
    );

    if (existingNote.rows.length === 0) {
      return res.status(404).json({
        error: 'Note not found',
      });
    }

    if (existingNote.rows[0].is_signed) {
      return res.status(409).json({
        error: 'Note is already signed and locked',
      });
    }

    const result = await pool.query(
      `
      UPDATE notes
      SET
        content = $1,
        signed_therapist = $2,
        signed_at = NOW(),
        is_signed = TRUE
      WHERE note_id = $3
      RETURNING *
      `,
      [
        content.trim(),
        signed_therapist.trim(),
        noteId,
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Error signing note:', err);
    res.status(500).json({
      error: 'Failed to sign note',
    });
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

// retrieve clinical docs for a patient
router.get("/clinical-documents/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM clinical_documents
       WHERE patient_id = $1
       ORDER BY uploaded_at DESC`,
      [patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve clinical documents" });
  }
});

// Retrieve one clinical document
router.get("/clinical-documents/document/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM clinical_documents
       WHERE document_id = $1`,
      [documentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Clinical document not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve clinical document"
    });
  }
});

module.exports = router;