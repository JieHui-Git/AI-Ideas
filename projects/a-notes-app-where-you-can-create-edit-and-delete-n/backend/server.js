const express = require('express');
const fs = require('fs-extra');
const path = require('path');

const app = express();
app.use(express.json());

const notesPath = path.join(__dirname, 'notes.json');

let idCounter = 0;
fs.readJson(notesPath).catch(() => {
  const initialNotes = [];
  fs.writeJsonSync(notesPath, initialNotes);
  return initialNotes;
}).then(initialNotes => {
  if (initialNotes.length > 0) {
    idCounter = Math.max(...initialNotes.map(note => note.id)) + 1;
  }
});

app.get('/api/notes', async (req, res) => {
  try {
    const notes = await fs.readJson(notesPath);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch notes' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Note text is required' });

    const note = { id: idCounter++, text };
    const notes = await fs.readJson(notesPath);
    notes.push(note);
    await fs.writeJson(notesPath, notes);

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Unable to add note' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Note text is required' });

    let notes = await fs.readJson(notesPath);
    const noteIndex = notes.findIndex(note => note.id === parseInt(id));
    if (noteIndex === -1) return res.status(404).json({ error: 'Note not found' });

    notes[noteIndex] = { id: parseInt(id), text };
    await fs.writeJson(notesPath, notes);

    res.json(notes[noteIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Unable to update note' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let notes = await fs.readJson(notesPath);
    notes = notes.filter(note => note.id !== parseInt(id));
    await fs.writeJson(notesPath, notes);

    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete note' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
