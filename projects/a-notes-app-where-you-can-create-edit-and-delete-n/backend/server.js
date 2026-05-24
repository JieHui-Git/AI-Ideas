const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const dataFilePath = path.join(__dirname, 'data.json');

const readData = () => {
  if (fs.existsSync(dataFilePath)) {
    return JSON.parse(fs.readFileSync(dataFilePath));
  }
  return [];
};

const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data));
};

app.get('/notes', (req, res) => {
  try {
    const notes = readData();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error accessing notes data' });
  }
});

app.post('/notes', (req, res) => {
  try {
    const newNote = {
      id: Date.now(),
      text: req.body.text,
    };
    const notes = readData();
    notes.push(newNote);
    writeData(notes);
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: 'Error adding note' });
  }
});

app.put('/notes/:id', (req, res) => {
  try {
    const notes = readData();
    const updatedNotes = notes.map(note =>
      note.id == req.params.id ? { ...note, text: req.body.text } : note
    );
    writeData(updatedNotes);
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ message: 'Error updating note' });
  }
});

app.delete('/notes/:id', (req, res) => {
  try {
    const notes = readData();
    const updatedNotes = notes.filter(note => note.id != req.params.id);
    writeData(updatedNotes);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
