import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get('/api/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const createNote = async (content) => {
    try {
      const response = await axios.post('/api/notes', { content });
      setNotes([...notes, response.data]);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const updateNote = async (id, content) => {
    try {
      const response = await axios.put(`/api/notes/${id}`, { content });
      setNotes(notes.map((note) => (note._id === id ? response.data : note)));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`);
      setNotes(notes.filter((note) => note._id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div>
      <h1>Notes App</h1>
      <input type="text" onChange={(e) => setNoteContent(e.target.value)} value={noteContent} />
      <button onClick={() => createNote(noteContent)}>Create Note</button>
      <ul>
        {notes.map((note) => (
          <li key={note._id}>
            <textarea
              value={note.content}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <button onClick={() => updateNote(note._id, noteContent)}>Update</button>
            <button onClick={() => deleteNote(note._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
