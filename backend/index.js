const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/forms', (req, res) => {
  const sql = 'SELECT * FROM form_templates';
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.get('/forms/:id', (req, res) => {
  const sql = 'SELECT * FROM form_templates WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      res.status(404).json({ message: 'Form template not found' });
    } else {
      res.json(result[0]);
    }
  });
});

// Create a new form template
app.post('/forms', (req, res) => {
  const { title, description, user_id } = req.body;
  const sql = 'INSERT INTO form_templates (title, description, user_id) VALUES (?, ?, ?)';
  db.query(sql, [title, description, user_id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Form template created', id: result.insertId });
  });
});

// Update a form template
app.put('/forms/:id', (req, res) => {
  const { title, description } = req.body;
  const sql = 'UPDATE form_templates SET title = ?, description = ? WHERE id = ?';
  db.query(sql, [title, description, req.params.id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Form template updated', id: req.params.id });
  });
});

// Delete a form template
app.delete('/forms/:id', (req, res) => {
  const sql = 'DELETE FROM form_templates WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Form template deleted', id: req.params.id });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
