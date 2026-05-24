import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');

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

  const addNote = async () => {
    if (noteText.trim() === '') return;
    try {
      await axios.post('http://localhost:3000/notes', { text: noteText });
      setNotes(prevNotes => [...prevNotes, { id: Date.now(), text: noteText }]);
      setNoteText('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const editNote = async (id, newText) => {
    try {
      await axios.put(`http://localhost:3000/notes/${id}`, { text: newText });
      setNotes(prevNotes =>
        prevNotes.map(note => (note.id === id ? { ...note, text: newText } : note))
      );
    } catch (error) {
      console.error('Error editing note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/notes/${id}`);
      setNotes(prevNotes =>
        prevNotes.filter(note => note.id !== id)
      );
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div>
      <h1>Notes App</h1>
      <input
        type="text"
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="Add a new note..."
      />
      <button onClick={addNote}>Add Note</button>

      <ul>
        {notes.map(note => (
          <li key={note.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{note.text}</span>
            <div>
              <input
                type="text"
                value={noteText}
                onChange={(e) => editNote(note.id, e.target.value)}
                onBlur={() => setNoteText('')}
              />
              <button onClick={() => deleteNote(note.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
