import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '', '']);
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await axios.get('http://localhost:8000/polls');
      setPolls(response.data);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    }
  };

  const createPoll = async (e) => {
    e.preventDefault();
    try {
      if (!newPollQuestion || newPollOptions.some(option => !option)) {
        alert("Please fill in all fields.");
        return;
      }
      const pollData = {
        question: newPollQuestion,
        options: newPollOptions.filter(option => option)
      };
      await axios.post('http://localhost:8000/polls', pollData);
      fetchPolls();
    } catch (error) {
      console.error('Failed to create poll:', error);
    }
  };

  const vote = async (pollId, optionIndex) => {
    try {
      await axios.post(`http://localhost:8000/polls/${pollId}/vote`, { optionIndex });
      fetchPolls();
    } catch (error) {
      console.error('Failed to cast vote:', error);
    }
  };

  return (
    <div>
      <h1>Create a Poll</h1>
      <form onSubmit={createPoll}>
        <input
          type="text"
          placeholder="Question"
          value={newPollQuestion}
          onChange={(e) => setNewPollQuestion(e.target.value)}
        />
        {newPollOptions.map((option, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) => {
              const newOptions = [...newPollOptions];
              newOptions[index] = e.target.value;
              setNewPollOptions(newOptions);
            }}
          />
        ))}
        <button type="submit">Create Poll</button>
      </form>

      <h1>Polls</h1>
      {polls.map(poll => (
        <div key={poll.id}>
          <h2>{poll.question}</h2>
          {poll.options.map((option, index) => (
            <div key={index}>
              <button onClick={() => vote(poll.id, index)}>
                {option} ({poll.votes[index] || 0})
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;
