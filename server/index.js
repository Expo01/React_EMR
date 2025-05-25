// server/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001; //backend server port

// Enable COR middleware to access front end
app.use(cors());


// Routes
const patientRoutes = require('./routes/patientRoutes'); // 'require' keyword effectively imports
// patientRoutes.js, and since that file exports the router, we now have access to API endpoints
app.use(patientRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});