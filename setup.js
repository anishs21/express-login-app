// setup.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

connection.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL");

  // Create DB
  connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`, (err) => {
    if (err) throw err;
    console.log(`Database '${process.env.DB_NAME}' ready`);

    // Switch to DB
    connection.changeUser({ database: process.env.DB_NAME }, (err) => {
      if (err) throw err;

      // Create users table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL
        );
      `;

      connection.query(createTableQuery, (err) => {
        if (err) throw err;
        console.log("Table 'users' ready");
        connection.end();
      });
    });
  });
});
