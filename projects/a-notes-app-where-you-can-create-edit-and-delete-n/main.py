import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

const notesFilePath = path.join(__dirname, 'notes.json');

if (!fs.existsSync(notesFilePath)) {
  fs.writeFileSync(notesFilePath, JSON.stringify([]));
}

let notes = JSON.parse(fs.readFileSync(notesFilePath));

app.get('/notes', (req, res) => {
  res.json(notes);
});

app.post('/note', (req, res) => {
  const note = {
    id: Date.now().toString(),
    content: req.body.content
  };
  notes.push(note);
  fs.writeFileSync(notesFilePath, JSON.stringify(notes));
  res.status(201).json(note);
});

app.delete('/note/:id', (req, res) => {
  const noteId = req.params.id;
  notes = notes.filter(note => note.id !== noteId);
  fs.writeFileSync(notesFilePath, JSON.stringify(notes));
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
