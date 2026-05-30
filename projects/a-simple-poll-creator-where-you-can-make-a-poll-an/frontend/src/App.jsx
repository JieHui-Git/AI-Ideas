import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [polls, setPolls] = useState([]);
  const [newPoll, setNewPoll] = useState({ question: '', options: [] });

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await axios.get('http://localhost:8000/polls');
      setPolls(response.data);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  const createPoll = async () => {
    try {
      await axios.post('http://localhost:8000/polls', newPoll);
      fetchPolls();
      setNewPoll({ question: '', options: [] });
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  const addOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
  };

  return (
    <div>
      <h1>Poll Creator</h1>
      <div>
        <input
          type="text"
          value={newPoll.question}
          onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
          placeholder="Enter poll question"
        />
        {newPoll.options.map((option, index) => (
          <div key={index}>
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
          </div>
        ))}
        <button onClick={addOption}>Add Option</button>
        <button onClick={createPoll}>Create Poll</button>
      </div>

      <h2>Polls</h2>
      {polls.map((poll, index) => (
        <div key={index}>
          <h3>{poll.question}</h3>
          <ul>
            {poll.options.map((option, index) => (
              <li key={index}>{`${option}: ${poll.votes[index] || 0}`}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default App;