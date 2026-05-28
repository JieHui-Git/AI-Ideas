```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleNoteChange = (event) => {
    setNewNote(event.target.value);
  };

  const addNote = async () => {
    try {
      if (newNote.trim() !== '') {
        await axios.post('http://localhost:3000/notes', { content: newNote });
        fetchNotes();
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/notes/${id}`);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div>
      <h1>Notes App</h1>
      <input
        type="text"
        value={newNote}
        onChange={handleNoteChange}
        placeholder="Add a new note"
      />
      <button onClick={addNote}>Add Note</button>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            {note.content}{' '}
            <button onClick={() => deleteNote(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```
