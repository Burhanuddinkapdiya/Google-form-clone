const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const multer = require("multer");
const cors = require('cors');
const path = require('path');

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

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Route to handle image uploads
app.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    const imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  } else {
    res.status(400).json({ error: 'Image upload failed' });
  }
});

// // Define a route to handle saving form data
// app.post("/saveFormData", async (req, res) => {
//   let connection;
//   try {
//     const formData = req.body;

//     // Start a new transaction
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     // Insert form data into the Form table
//     const [formResult] = await connection.query(
//       "INSERT INTO survey_form (title, description) VALUES (?, ?)",
//       [formData.title, formData.description]
//     );
//     const formId = formResult.insertId;

//     // Insert field data into the Field table
//     await Promise.all(
//       formData.fields.map(async (fieldData) => {
//         await connection.query(
//           "INSERT INTO survey_questions (s_id, type, label, options, required, p_q_id, on_value) VALUES (?, ?, ?, ?, ?, ?, ?)",
//           [
//             formId,
//             fieldData.type,
//             fieldData.label,
//             JSON.stringify(fieldData.options),
//             fieldData.required || false,
//             fieldData.p_q_id || null,
//             fieldData.on_value || null,
//           ]
//         );
//       })
//     );

//     // Commit the transaction
//     await connection.commit();
//     connection.release();

//     // Send the formId in the response
//     res.status(200).json({ formId, message: "Form data saved successfully" });
//   } catch (error) {
//     console.error("Error saving form data:", error);
//     res.status(500).json({ error: "Failed to save form data" });

//     // Rollback the transaction in case of error
//     if (connection) {
//       await connection.rollback();
//       connection.release();
//     }
//   }
// });

app.post("/saveSurvey", async (req, res) => {
  let connection;
  try {
    const { title, description } = req.body;

    // Start a new transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert the title and description into the survey_form table
    const [formResult] = await connection.query(
      "INSERT INTO survey_form (title, description) VALUES (?, ?)",
      [title, description]
    );
    const formId = formResult.insertId;

    // Commit the transaction
    await connection.commit();
    connection.release();

    // Send the formId in the response
    res.status(200).json({ formId, message: "Survey saved successfully" });
  } catch (error) {
    console.error("Error saving survey:", error);
    res.status(500).json({ error: "Failed to save survey" });

    // Rollback the transaction in case of error
    if (connection) {
      await connection.rollback();
      connection.release();
    }
  }
});


// // Define a route to handle saving form data
// app.post("/saveSubQuestion", async (req, res) => {
//   let connection;
//   try {
//     const subFieldsData = req.body;

//     // Start a new transaction
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     // Loop through each sub-field data and insert into survey_questions table
//     await Promise.all(
//       subFieldsData.map(async (subField) => {
//         await connection.query(
//           "INSERT INTO survey_questions (s_id, type, label, options, required, p_q_id, on_value) VALUES (?, ?, ?, ?, ?, ?, ?)",
//           [
//             subField.surveyId,
//             subField.type,
//             subField.label,
//             JSON.stringify(subField.options),
//             subField.required || false,
//             subField.p_q_id,
//             subField.on_value,
//           ]
//         );
//       })
//     );

//     // Commit the transaction
//     await connection.commit();
//     connection.release();

//     res.status(200).json({ message: "Sub-questions saved successfully" });
//   } catch (error) {
//     console.error("Error saving sub-questions:", error);
//     res.status(500).json({ error: "Failed to save sub-questions" });

//     // Rollback the transaction in case of error
//     if (connection) {
//       await connection.rollback();
//       connection.release();
//     }
//   }
// });

app.post("/saveQuestion", async (req, res) => {
  let connection;
  try {
    const questionData = req.body;

    // Start a new transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert the question data into the survey_questions table
    const [questionResult] = await connection.query(
      "INSERT INTO survey_questions (s_id, type, label, options, required, p_q_id, on_value) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        questionData.s_id,
        questionData.type,
        questionData.label,
        JSON.stringify(questionData.options),
        questionData.required || false,
        questionData.p_q_id || null,
        questionData.on_value || null,
      ]
    );
    const questionId = questionResult.insertId;

    // Commit the transaction
    await connection.commit();
    connection.release();

    // Send the questionId in the response
    res.status(200).json({ questionId, message: "Question saved successfully" });
  } catch (error) {
    console.error("Error saving question:", error);
    res.status(500).json({ error: "Failed to save question" });

    // Rollback the transaction in case of error
    if (connection) {
      await connection.rollback();
      connection.release();
    }
  }
});

// Backend: updateQuestion endpoint
app.put('/updateQuestion/:id', async (req, res) => {
  try {
    const questionId = req.params.id;
    const updatedData = req.body;

    // Validate the updated data here if needed

    // Start a new transaction (optional, depends on your application requirements)
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    // Update the question in the survey_questions table
    const [updateResult] = await connection.query(
      "UPDATE survey_questions SET type = ?, label = ?, options = ?, required = ?, p_q_id = ?, on_value = ? WHERE q_id = ?",
      [
        updatedData.type,
        updatedData.label,
        JSON.stringify(updatedData.options),
        updatedData.required || false,
        updatedData.p_q_id || null,
        updatedData.on_value || null,
        questionId
      ]
    );

    // Commit the transaction
    await connection.commit();
    connection.release();

    // Check if the question was updated successfully
    if (updateResult.affectedRows > 0) {
      res.status(200).json({ message: 'Question updated successfully' });
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Backend: deleteQuestion endpoint
// Backend: deleteQuestion endpoint
app.delete('/deleteQuestion/:id', async (req, res) => {
  try {
    const questionId = req.params.id;

    // Start a new transaction (optional, depends on your application requirements)
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    // Delete the question from the survey_questions table
    const [deleteResult] = await connection.query(
      "DELETE FROM survey_questions WHERE q_id = ?",
      [questionId]
    );

    // Commit the transaction
    await connection.commit();
    connection.release();

    // Check if the question was deleted successfully
    if (deleteResult.affectedRows > 0) {
      res.status(200).json({ message: 'Question deleted successfully' });
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Define a route to handle deleting a form and its associated questions
app.delete('/deleteForm/:formId', async (req, res) => {
  let connection;
  try {
    const formId = req.params.formId;

    // Start a new transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Delete associated questions first
    await connection.query("DELETE FROM survey_questions WHERE s_id = ?", [formId]);

    // Delete the form itself
    await connection.query("DELETE FROM survey_form WHERE s_id = ?", [formId]);

    // Commit the transaction
    await connection.commit();
    connection.release();

    res.status(200).json({ message: 'Form and associated questions deleted successfully' });
  } catch (error) {
    console.error('Error deleting form and questions:', error);

    // Rollback the transaction in case of error
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    res.status(500).json({ error: 'Failed to delete form and questions' });
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
      "SELECT f.s_id, f.title, f.description, fi.q_id AS field_id, fi.type, fi.label, fi.options, fi.required, fi.p_q_id, fi.on_value FROM survey_form f JOIN survey_questions fi ON f.s_id = fi.s_id WHERE f.s_id = ?",
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
        p_q_id: field.p_q_id,
        on_value:field.on_value
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
