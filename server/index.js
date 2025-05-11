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
  user: 'chrisdailey', // replace with your macOS username
  host: 'localhost',
  database: 'patients',
  password: '', // leave blank if no password set
  port: 5432,
});

// API endpoint to get patient records
app.get('/patients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patient_info LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).send('Database error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
