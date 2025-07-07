const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require("./db"); // using mysql2 connection pool
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // serve index.html and register.html

// LOGIN API
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  pool.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("DB error (login):", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful" });
  });
});

// REGISTER API
app.post("/api/register", (req, res) => {
  console.log('Register API hit');
  const { email, password } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Connection error:", err);
      return res.status(500).json({ error: "Database connection failed" });
    }

    // ✅ Use the 'connection' object from the pool
    connection.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) {
        connection.release();  // always release
        console.error("DB error (register-check):", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        connection.release();  // always release
        return res.status(400).json({ error: "Email already registered" });
      }

      connection.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, password],
        (err) => {
          connection.release();  // always release
          if (err) {
            console.error("DB error (insert):", err);
            return res.status(500).json({ error: "Error saving user" });
          }

          res.json({ message: "Registered successfully" });
        }
      );
    });
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});