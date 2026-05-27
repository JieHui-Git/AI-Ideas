const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const dbPath = 'notes.db';
let db;

function initDatabase() {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');

    db.serialize(() => {
      db.run("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT)");
    });
  });
}

app.get('/notes', async (req, res) => {
  await new Promise((resolve) => db.all("SELECT * FROM notes", [], function (err, rows) {
    if (err) {
      throw err;
    }
    resolve(rows);
  }));
  res.json(notes);
});

app.post('/notes', (req, res) => {
  const note = req.body;
  db.run("INSERT INTO notes (text) VALUES (?)", [note.text], function(err) {
    if (err) {
      return console.log(err.message);
    }
    note.id = this.lastID;
    res.status(201).json(note);
  });
});

app.put('/notes/:id', async (req, res) => {
  const id = req.params.id;
  const noteText = req.body.text;
  await new Promise((resolve) => db.run("UPDATE notes SET text = ? WHERE id = ?", [noteText, id], function(err) {
    if (err) {
      return console.log(err.message);
    }
    resolve();
  }));
  res.json({ message: 'Note updated' });
});

app.delete('/notes/:id', async (req, res) => {
  const id = req.params.id;
  await new Promise((resolve) => db.run("DELETE FROM notes WHERE id = ?", [id], function(err) {
    if (err) {
      return console.log(err.message);
    }
    resolve();
  }));
  res.json({ message: 'Note deleted' });
});

initDatabase();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
