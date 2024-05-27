const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const multer = require("multer");
const cors = require('cors');

// Create an Express application
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies

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

// Middleware for CORS and headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // Replace with the origin of your frontend application
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

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

// Define a route to handle submitting form data (including file uploads)
app.post('/submitFormData', upload.any(), async (req, res) => {
  const formData = req.body;
  const files = req.files;
  let connection;

  try {
    // Extract and delete surveyId and itsId from formData
    const surveyId = formData.surveyId;
    const itsId = formData.itsId;
    delete formData.surveyId;
    delete formData.itsId;

    
    // Validate that itsId is provided
    if (!itsId) {
      return res.status(400).json({ error: 'ITS ID is required' });
    }

    // Start a new transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Process each answer and handle file uploads
    const promises = [];

    // Handle form data fields
    Object.keys(formData).forEach(key => {
      const answerValue = formData[key];
      promises.push(
        connection.query(
          'INSERT INTO survey_answers (s_id, q_id, its_id, answer) VALUES (?, ?, ?, ?)', 
          [surveyId, key, itsId, answerValue]
        )
      );
    });

    // Handle file uploads
    files.forEach(file => {
      promises.push(
        connection.query(
          'INSERT INTO survey_answers (s_id, q_id, its_id, answer) VALUES (?, ?, ?, ?)', 
          [surveyId, file.fieldname, itsId, file.filename]
        )
      );
    });

    // Wait for all promises to complete
    await Promise.all(promises);

    // Commit the transaction
    await connection.commit();
    connection.release();

    console.log('Survey answer data saved successfully');
    res.status(200).json({ message: 'Survey answer data saved successfully' });
  } catch (error) {
    console.error('Error saving survey answer data:', error);
    res.status(500).json({ error: 'Failed to save survey answer data' });

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

    // Check if formData is not undefined and has at least one item
    if (!formData || formData.length === 0) {
      return res.status(404).json({ error: "Form data not found" });
    }

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

// Validating if the form is submitted previously or not
app.get("/checkSurveyData/:formId/:itsId", async (req, res) => {
  try {
    const { formId, itsId } = req.params;
    const [answers] = await pool.query(
      "SELECT * FROM survey_answers WHERE s_id = ? AND its_id = ?",
      [formId, itsId]
    );

    if (!answers || answers.length === 0) {
      return res.status(404).json({ exists: false });
    }

    res.status(200).json({ exists: true });
  } catch (error) {
    console.error("Error checking survey data:", error);
    res.status(500).json({ error: "Failed to check survey data" });
  }
});

// Deleting survey data
app.delete("/deleteSurveyData/:formId/:itsId", async (req, res) => {
  try {
    const { formId, itsId } = req.params;
    await pool.query("DELETE FROM survey_answers WHERE s_id = ? AND its_id = ?", [formId, itsId]);
    res.status(200).json({ message: "Survey data deleted successfully" });
  } catch (error) {
    console.error("Error deleting survey data:", error);
    res.status(500).json({ error: "Failed to delete survey data" });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
