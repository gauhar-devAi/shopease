// This file handles our database connection
const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool
// A pool manages multiple connections automatically - better than single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,         // from .env file
  user: process.env.DB_USER,         // from .env file
  password: process.env.DB_PASSWORD, // from .env file
  database: process.env.DB_NAME,     // from .env file
  port: process.env.DB_PORT || 3306, // Railway may provide a custom DB port
  waitForConnections: true,
  connectionLimit: 10,               // max 10 connections at once
  queueLimit: 0
});

// Convert pool to use promises (lets us use async/await)
const db = pool.promise();

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Railway Database connected!');
    connection.release(); // release connection back to pool
  }
});

module.exports = db;