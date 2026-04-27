// This file handles our database connection
const mysql = require('mysql2');
require('dotenv').config();

// Build config from DATABASE_URL (preferred in hosting) or individual DB_* vars.
const buildPoolConfig = () => {
  const commonConfig = {
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  if (process.env.DATABASE_URL) {
    const dbUrl = new URL(process.env.DATABASE_URL);

    const config = {
      host: dbUrl.hostname,
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.replace(/^\//, ''),
      port: dbUrl.port ? Number(dbUrl.port) : 3306,
      ...commonConfig
    };

    if (process.env.DB_SSL === 'true') {
      config.ssl = { rejectUnauthorized: false };
    }

    return config;
  }

  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    ...commonConfig
  };

  if (process.env.DB_SSL === 'true') {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
};

const pool = mysql.createPool(buildPoolConfig());

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