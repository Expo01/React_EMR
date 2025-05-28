// the purpose of this file is to house all API endpoints related to patient information. 
// it is contained in the 'routes' folder which will contain other files to organize 
// API endpoints by category such as other endpoints for auth, etc. 

// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');


// all API endpoints will huse the app express object to build the API endpoints. the parameter
// of the db tabble/extension is passed '/tableName' which is then used when the pool object query
// function attempts to query the DB table with the specified SQL statement and storeds into 
//JSON (javascript object notation)
// API endpoint to get patient info from patient_info table

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

// note for specific pt
router.get('/notes/:patientId', async (req, res) => {
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

// appointments for specific pt
router.get('/appointments/:patientId', async (req, res) => { // :patientId serves as a 
  //placeholder that i name. ':' is mandatory, the rest is best naming practice to match
  // req.params const and sql query. Accepts patient_id info from selected record
  const { patientId } = req.params; // req.params handles the dynamic portion of a URL 
  // which is here is the unique patient id
  try {
    const result = await pool.query(
      'SELECT * FROM appointments WHERE patient_id = $1 ORDER BY scheduled_date, scheduled_time',
      [patientId] // that patient id extracted from the request is used in sql query
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
