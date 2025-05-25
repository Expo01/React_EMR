// server/index.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3001; //backend server port

// Enable CORS for frontend access
app.use(cors());

// Pool obj manages connection to specified PostgreSQL DB
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

// New endpoint to fetch a single patient by ID
// required due to window.open() populating a completing new instance of the React app
// which does not maintain memory from UseEffect/UseState on the main page
app.get('/patients/:id', async (req, res) => {
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
