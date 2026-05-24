const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(bodyParser.json());

// Create database connection
let db = new sqlite3.Database(':memory:', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to the in-memory SQLite database.');
});

// Define table schema
db.serialize(() => {
  db.run("CREATE TABLE notes (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT)");
});

// Create a new note
app.post('/notes', (req, res) => {
  const { content } = req.body;
  let stmt = db.prepare("INSERT INTO notes (content) VALUES (?)");
  stmt.run(content, function(err) {
    if (err) {
      return console.log(`Error inserting in notes table: ${err.message}`);
    }
    res.json({ id: this.lastID, content });
  });
  stmt.finalize();
});

// Retrieve all notes
app.get('/notes', (req, res) => {
  db.all("SELECT * FROM notes", [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.json(rows);
  });
});

// Retrieve a single note by ID
app.get('/notes/:id', (req, res) => {
  const { id } = req.params;
  db.all("SELECT * FROM notes WHERE id = ?", [id], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    if (rows.length === 1) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Note not found');
    }
  });
});

// Update a note
app.put('/notes/:id', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  db.run("UPDATE notes SET content = ? WHERE id = ?", [content, id], function(err) {
    if (err) {
      return console.error(`Error updating note ${id}: ${err.message}`);
    }
    res.json({ id, content });
  });
});

// Delete a note
app.delete('/notes/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM notes WHERE id = ?", [id], function(err) {
    if (err) {
      return console.error(`Error deleting note ${id}: ${err.message}`);
    }
    res.status(204).send();
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
