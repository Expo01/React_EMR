// server/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001; //backend server port

// Enable Cors middleware to access front end
app.use(cors());

app.use(express.json());


// Routes
const patientRoutes = require('./routes/patientRoutes'); 
app.use(patientRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});