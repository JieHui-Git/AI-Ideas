import React, { useState, useEffect } from 'react';

const NotesApp = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/notes')
      .then(res => res.json())
      .then(data => setNotes(data));
  }, []);

  const addNote = async () => {
    try {
      const response = await fetch('http://localhost:3000/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      if (response.ok) {
        const newNote = await response.json();
        setNotes([...notes, newNote]);
        setTitle('');
        setContent('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const updateNote = async (id, newTitle, newContent) => {
    try {
      const response = await fetch(`http://localhost:3000/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent })
      });
      if (response.ok) {
        const updatedNotes = notes.map(note => note.id === id ? { ...note, title: newTitle, content: newContent } : note);
        setNotes(updatedNotes);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`http://localhost:3000/notes/${id}`, { method: 'DELETE' });
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div>
      <h1>Notes App</h1>
      <form onSubmit={(e) => { e.preventDefault(); addNote(); }}>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" required></textarea>
        <button type="submit">Add Note</button>
      </form>
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
            <form onSubmit={(e) => { e.preventDefault(); updateNote(note.id, title, content); }}>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" required></textarea>
              <button type="submit">Update Note</button>
            </form>
            <button onClick={() => deleteNote(note.id)}>Delete Note</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotesApp;
