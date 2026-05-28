const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const notesFilePath = path.join(__dirname, 'notes.json');

if (!fs.existsSync(notesFilePath)) {
  fs.writeFileSync(notesFilePath, JSON.stringify([]));
}

let noteId = 1;

app.get('/api/notes', (req, res) => {
  const notes = JSON.parse(fs.readFileSync(notesFilePath));
  res.send(notes);
});

app.post('/api/notes', (req, res) => {
  const notes = JSON.parse(fs.readFileSync(notesFilePath));
  const newNote = { id: noteId++, content: req.body.content };
  notes.push(newNote);
  fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
  res.send(newNote);
});

app.delete('/api/notes/:id', (req, res) => {
  const notes = JSON.parse(fs.readFileSync(notesFilePath));
  const updatedNotes = notes.filter(note => note.id !== parseInt(req.params.id));
  fs.writeFileSync(notesFilePath, JSON.stringify(updatedNotes, null, 2));
  res.sendStatus(204);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
