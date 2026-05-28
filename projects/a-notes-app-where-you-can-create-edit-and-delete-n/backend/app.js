const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(bodyParser.json());

let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Table created successfully');
    }
  });
});

app.get('/api/notes', (req, res) => {
  db.all('SELECT * FROM notes', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/notes', (req, res) => {
  const content = req.body.content;
  db.run('INSERT INTO notes (content) VALUES (?)', [content], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, content });
  });
});

app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const content = req.body.content;
  db.run('UPDATE notes SET content = ? WHERE _id = ?', [content, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ affectedRows: this.changes });
  });
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM notes WHERE _id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ affectedRows: this.changes });
  });
});

app.listen(3000, () => console.log('Server started on port 3000'));
