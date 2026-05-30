const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

let notesFile = path.join(__dirname, 'notes.json');

if (!fs.existsSync(notesFile)) {
  fs.writeFileSync(notesFile, JSON.stringify([], null, 2));
}

let notesData = JSON.parse(fs.readFileSync(notesFile, 'utf-8'));

const saveNotes = () => {
  fs.writeFileSync(notesFile, JSON.stringify(notesData, null, 2));
};

app.get('/notes', (req, res) => {
  res.json(notesData);
});

app.post('/notes', (req, res) => {
  const note = { id: Date.now().toString(), title: req.body.title, content: req.body.content };
  notesData.push(note);
  saveNotes();
  res.status(201).json(note);
});

app.put('/notes/:id', (req, res) => {
  const noteIndex = notesData.findIndex(n => n.id === req.params.id);
  if (noteIndex !== -1) {
    notesData[noteIndex] = { id: req.params.id, title: req.body.title, content: req.body.content };
    saveNotes();
    res.json(notesData[noteIndex]);
  } else {
    res.status(404).send('Note not found');
  }
});

app.delete('/notes/:id', (req, res) => {
  const noteIndex = notesData.findIndex(n => n.id === req.params.id);
  if (noteIndex !== -1) {
    notesData.splice(noteIndex, 1);
    saveNotes();
    res.status(204).send();
  } else {
    res.status(404).send('Note not found');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "../frontend/dist/index.html")));
