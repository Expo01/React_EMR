// server/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'chrisdailey',
  host: 'localhost',
  database: 'patients',
  password: '',
  port: 5432,
});

module.exports = pool;
