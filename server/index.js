// server/index.js
const app = require('./app');

const PORT = 3001; //backend server port

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});