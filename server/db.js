// server/db.js
const { Pool } = require('pg');

const database =
  process.env.NODE_ENV === 'test'
    ? 'patients_test'
    : 'patients';

const pool = new Pool({
  user: 'chrisdailey',
  host: 'localhost',
  database: database,
  password: '',
  port: 5432,
});

module.exports = pool;
