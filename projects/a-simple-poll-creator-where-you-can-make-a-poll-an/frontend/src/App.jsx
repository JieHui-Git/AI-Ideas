import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [polls, setPolls] = useState([]);

  const submitPoll = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/polls', { question, options });
      getPolls();
      setQuestion('');
      setOptions(['', '']);
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const getPolls = async () => {
    try {
      const response = await axios.get('http://localhost:5000/polls');
      setPolls(response.data);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  const vote = async (pollId, optionIndex) => {
    try {
      await axios.post(`http://localhost:5000/votes/${pollId}/${optionIndex}`);
      getPolls();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <div>
      <h1>Poll App</h1>
      <form onSubmit={submitPoll}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter question"
        />
        {options.map((option, i) => (
          <div key={i}>
            <input
              type="text"
              value={option}
              onChange={(e) =>
                setOptions(options.map((o, j) => (j === i ? e.target.value : o)))
              }
              placeholder={`Enter option ${i + 1}`}
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => setOptions(options.filter((_, j) => j !== i))}
              >
                Remove Option
              </button>
            )}
          </div>
        ))}
        <button>Add Option</button>
        <button type="submit">Create Poll</button>
      </form>
      {polls.map((poll) => (
        <div key={poll.id}>
          <h2>{poll.question}</h2>
          {poll.options.map((option, i) => (
            <button:key={i} onClick={() => vote(poll.id, i)}>
              {option}: {poll.votes[i]}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;
