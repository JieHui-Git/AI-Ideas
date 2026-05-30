import React, { useState, useEffect } from 'react';
import axios from 'axios';
import uuid from 'uuid';

function App() {
  const [polls, setPolls] = useState([]);
  const [newPoll, setNewPoll] = useState({ title: '', options: [{ id: uuid.v4(), text: '' }] });

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await axios.get('/polls');
      setPolls(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createPoll = async () => {
    try {
      const optionsWithoutEmptyText = newPoll.options.filter(option => option.text.trim() !== '');
      if (optionsWithoutEmptyText.length < 2) {
        alert('Please provide at least two options.');
        return;
      }

      await axios.post('/polls', { ...newPoll, options: optionsWithoutEmptyText });
      setNewPoll({ title: '', options: [{ id: uuid.v4(), text: '' }] });
      fetchPolls();
    } catch (error) {
      console.error(error);
    }
  };

  const addOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, { id: uuid.v4(), text: '' }]
    }));
  };

  return (
    <div>
      <h1>Poll Creator</h1>
      <div>
        <input
          placeholder="Poll Title"
          value={newPoll.title}
          onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
        />
        {newPoll.options.map(option => (
          <div key={option.id}>
            <input
              placeholder={`Option ${newPoll.options.indexOf(option) + 1}`}
              value={option.text}
              onChange={(e) =>
                setNewPoll({
                  ...newPoll,
                  options: newPoll.options.map(o => (o.id === option.id ? { ...o, text: e.target.value } : o))
                })
              }
            />
          </div>
        ))}
        <button onClick={addOption}>Add Option</button>
        <button onClick={createPoll}>Create Poll</button>
      </div>
      <h2>Polls</h2>
      {polls.map(poll => (
        <div key={poll.id}>
          <h3>{poll.title}</h3>
          <ul>
            {poll.options.map(option => (
              <li key={option.id}>
                {option.text} - {option.votes || 0} votes
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;
