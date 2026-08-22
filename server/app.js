const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

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

module.exports = app;