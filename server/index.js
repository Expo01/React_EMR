// server/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001; //backend server port
const path = require('path');

// Enable Cors middleware to access front end
app.use(cors());
app.use(express.json());

//clinical docs folder
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// Routes
const patientRoutes = require('./routes/patientRoutes'); 
app.use(patientRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});