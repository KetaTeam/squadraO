const { Pool } = require('pg');
require('dotenv').config();

// Código corrigido
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME, // Chave correta
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  });

module.exports = pool;

