import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotesApp = () => {
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

  const addNote = async () => {
    if (newNote.trim() === '') return;

    try {
      await axios.post('http://localhost:3000/note', { content: newNote });
      setNewNote('');
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/note/${id}`);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div>
      <h1>Notes</h1>
      <input
        type="text"
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
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
};

export default NotesApp;
