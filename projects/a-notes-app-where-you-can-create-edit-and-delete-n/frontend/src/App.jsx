import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  async function addNote() {
    await axios.post('http://localhost:8000/notes', { text: noteText });
    setNoteText('');
    fetchNotes();
  }

  async function deleteNote(id) {
    await axios.delete(`http://localhost:8000/notes/${id}`);
    fetchNotes();
  }

  async function updateNote(id, newText) {
    await axios.put(`http://localhost:8000/notes/${id}`, { text: newText });
    fetchNotes();
  }

  async function fetchNotes() {
    const response = await axios.get('http://localhost:8000/notes');
    setNotes(response.data);
  }

  return (
    <div>
      <h1>Notes App</h1>
      <input value={noteText} onChange={(e) => setNoteText(e.target.value)} />
      <button onClick={addNote}>Add Note</button>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <input
              type="text"
              value={note.text}
              onChange={(e) => updateNote(note.id, e.target.value)}
            />
            <button onClick={() => deleteNote(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
