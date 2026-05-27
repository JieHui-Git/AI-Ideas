const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let db = new sqlite3.Database('./Poll.db', (err) => {
  if (err) throw err;
  console.log('Connected to SQLite database.');
});

// Create poll table
db.serialize(() => {
  const sqlQuery = `
    CREATE TABLE IF NOT EXISTS polls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      options TEXT[] NOT NULL
    )
  `;
  db.run(sqlQuery, (err) => {
    if (err) throw err;
    console.log('Poll table created.');
  });
});

// Get all polls
app.get('/api/polls', async (req, res) => {
  try {
    const query = 'SELECT * FROM polls';
    const polls = await new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
    res.json(polls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new poll
app.post('/api/poll', async (req, res) => {
  try {
    const { question, options } = req.body;
    if (!question || !options.length) throw new Error('Invalid data');
    const query = 'INSERT INTO polls (question, options) VALUES (?, ?)';
    await new Promise((resolve, reject) => {
      db.run(query, [question, JSON.stringify(options)], function(err) {
        if (err) return reject(err);
        resolve(this.lastID);
      });
    });
    res.status(201).json({ id: this.lastID });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Vote on a poll
app.post('/api/poll/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { optionIndex } = req.body;
    if (!optionIndex || isNaN(optionIndex)) throw new Error('Invalid vote');
    const query = 'SELECT * FROM polls WHERE id = ?';
    const poll = await new Promise((resolve, reject) => {
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!poll) throw new Error('Poll not found');

    let optionsArr = JSON.parse(poll.options);
    if (optionIndex >= optionsArr.length || optionIndex < 0)
      throw new Error('Invalid vote');

    optionsArr[optionIndex]++;
    const updateQuery = 'UPDATE polls SET options = ? WHERE id = ?';
    await new Promise((resolve, reject) => {
      db.run(updateQuery, [JSON.stringify(optionsArr), id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.status(200).json({ message: 'Vote recorded' });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Get vote count for a poll
app.get('/api/poll/:id/votes', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT options FROM polls WHERE id = ?';
    const poll = await new Promise((resolve, reject) => {
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!poll) throw new Error('Poll not found');

    let resultArr = JSON.parse(poll.options).map((option) => 0);

    const optionsCountQuery = 'SELECT options FROM polls WHERE id IN (';
    for (let i = 1; i <= poll.id; i++) {
      if (i > 1) optionsCountQuery += ', ';
      optionsCountQuery += '?';
    }
    optionsCountQuery += ')';

    await new Promise((resolve, reject) => {
      db.all(optionsCountQuery, Array.from({ length: poll.id }, (_, i) => {
        if (optionsArr[i] >= resultArr.length)
          return JSON.parse(JSON.stringify(resultArr));
        else
          return i + 1;
      }), (err, rows) => {
        if (err) return reject(err);
        rows.forEach((row) => {
          const options = JSON.parse(row.options);
          for (let i = 0; i < resultArr.length; i++) {
            if (options[i] > resultArr[i])
              resultArr[i] = options[i];
          }
        });
        resolve();
      });
    });

    res.json(resultArr);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3001, () => {
  console.log('Poll app backend running on port 3001');
});
