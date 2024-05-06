// Import necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");

// Create an Express application
const app = express();
app.use(bodyParser.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "your_mysql_username",
  password: "your_mysql_password",
  database: "your_mysql_database_name",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Define a route to handle saving form data
app.post("/saveFormData", async (req, res) => {
  try {
    const formData = req.body;

    // Start a new transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert form data into the Form table
    const [formResult] = await connection.query(
      "INSERT INTO Form (title, description) VALUES (?, ?)",
      [formData.title, formData.description]
    );
    const formId = formResult.insertId;

    // Insert field data into the Field table
    await Promise.all(
      formData.fields.map(async (fieldData) => {
        await connection.query(
          "INSERT INTO Field (form_id, type, label, options, required) VALUES (?, ?, ?, ?, ?)",
          [formId, fieldData.type, fieldData.label, JSON.stringify(fieldData.options), fieldData.required || false]
        );
      })
    );

    // Commit the transaction
    await connection.commit();
    connection.release();

    res.status(200).json({ message: "Form data saved successfully" });
  } catch (error) {
    console.error("Error saving form data:", error);
    res.status(500).json({ error: "Failed to save form data" });

    // Rollback the transaction in case of error
    if (connection) {
      await connection.rollback();
      connection.release();
    }
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
