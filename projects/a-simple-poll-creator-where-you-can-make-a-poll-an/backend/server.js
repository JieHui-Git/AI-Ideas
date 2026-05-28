const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE polls (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, options TEXT)");
});

function getPolls(callback) {
  db.all('SELECT * FROM polls', [], callback);
}

function createPoll(title, options, callback) {
  const sql = 'INSERT INTO polls (title, options) VALUES (?, ?)';
  db.run(sql, [title, JSON.stringify(options)], function(err, row) {
    if (err) throw err;
    callback(row.lastID);
  });
}

app.get('/polls', (req, res) => {
  getPolls((err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

app.post('/polls', (req, res) => {
  const { title, options } = req.body;
  createPoll(title, options, (id) => {
    res.json({ id, title, options });
  });
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001/'));
