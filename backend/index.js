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
  user: "bk",
  password: "bk53",
  database: "survey",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // Replace with the origin of your frontend application
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
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
      "INSERT INTO survey_form (title, description) VALUES (?, ?)",
      [formData.title, formData.description]
    );
    const formId = formResult.insertId;

    // Insert field data into the Field table
    await Promise.all(
      formData.fields.map(async (fieldData) => {
        await connection.query(
          "INSERT INTO survey_questions (s_id, type, label, options, required) VALUES (?, ?, ?, ?, ?)",
          [
            formId,
            fieldData.type,
            fieldData.label,
            JSON.stringify(fieldData.options),
            fieldData.required || false,
          ]
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
// Define a route to handle fetching form data along with field data based on form ID
app.get("/formData/:formId", async (req, res) => {
  try {
    const formId = req.params.formId;

    // Fetch form data and corresponding field data based on form ID using a SQL join
    const [formData] = await pool.query(
      "SELECT f.s_id, f.title, f.description, fi.q_id AS field_id, fi.type, fi.label, fi.options, fi.required FROM survey_form f JOIN survey_questions fi ON f.s_id = fi.s_id WHERE f.s_id = ?",
      [formId]
    );

    // Format the fetched data as an object containing form title, description, and fields
    const formattedData = {
      title: formData[0].title,
      description: formData[0].description,
      fields: formData.map((field) => ({
        id: field.field_id,
        type: field.type,
        label: field.label,
        options: JSON.parse(field.options),
        required: field.required,
      })),
    };

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching form data:", error);
    res.status(500).json({ error: "Failed to fetch form data" });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
