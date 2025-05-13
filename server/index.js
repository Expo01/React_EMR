// server/index.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;

// Enable CORS for frontend access
app.use(cors());

// PostgreSQL connection setup
const pool = new Pool({
  user: 'chrisdailey', 
  host: 'localhost',
  database: 'patients',
  password: '', // none set
  port: 5432,
});

// API endpoint to get patient info from patient_info table
app.get('/patients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patient_info LIMIT 3');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).send('Database error');
  }
});

// API endpoint to get notes from notes table
app.get('/notes', async(req,res) =>{
    try {
        const result = await pool.query('SELECT * FROM notes LIMIT 3');
        res.json(result.rows);
    } catch(err) {
        console.error('error fetching notes', err);
        res.status(500).send('database error');
    }
});

// API endpoint to get appointments from appointments table
app.get('/appointments', async(req,res) =>{
    try {
        const result = await pool.query('SELECT * FROM appointments LIMIT 3');
        res.json(result.rows);
    } catch(err) {
        console.error('error fetching notes', err);
        res.status(500).send('database error');
    }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
