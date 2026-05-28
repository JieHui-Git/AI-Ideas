```js
const express = require('express');
const fs = require('fs-extra');
const path = require('path');

const app = express();
app.use(express.json());

const dataFilePath = path.join(__dirname, 'notes.json');

async function readNotes() {
  try {
    return await fs.readJson(dataFilePath);
  } catch (error) {
    if (error.code === ' ENOENT') {
      return [];
    }
    throw error;
  }
}

app.get('/notes', async (req, res) => {
  const notes = await readNotes();
  res.json(notes);
});

app.post('/notes', async (req, res) => {
  const notes = await readNotes();
  const newNote = {
    id: Date.now().toString(),
    content: req.body.content,
  };
  notes.push(newNote);
  await fs.writeJson(dataFilePath, notes, { spaces: 2 });
  res.json(newNote);
});

app.delete('/notes/:id', async (req, res) => {
  const notes = await readNotes();
  const updatedNotes = notes.filter((note) => note.id !== req.params.id);
  await fs.writeJson(dataFilePath, updatedNotes, { spaces: 2 });
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```
