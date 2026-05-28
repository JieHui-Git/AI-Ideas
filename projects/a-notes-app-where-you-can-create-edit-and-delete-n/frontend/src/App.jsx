import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  const addNote = async () => {
    if (!noteText.trim()) return;
    try {
      const response = await axios.post('/api/notes', { text: noteText });
      setNotes([...notes, response.data]);
      setNoteText('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const editNote = async () => {
    if (!noteText.trim()) return;
    try {
      await axios.put(`/api/notes/${editingId}`, { text: noteText });
      setNotes(notes.map(note => note.id === editingId ? { ...note, text: noteText } : note));
      setEditMode(false);
      setEditingId(null);
      setNoteText('');
    } catch (error) {
      console.error('Error editing note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div>
      <h1>Notes App</h1>
      <input
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="Enter a note"
      />
      {editMode ? (
        <button onClick={editNote}>Save Note</button>
      ) : (
        <button onClick={addNote}>Add Note</button>
      )}
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            {note.text}
            <div>
              <button onClick={() => {
                setEditMode(true);
                setEditingId(note.id);
                setNoteText(note.text);
              }}>Edit</button>
              <button onClick={() => deleteNote(note.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
