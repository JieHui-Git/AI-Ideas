import React, { useState, useEffect } from 'react';

const App = () => {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [voteCount, setVoteCount] = useState([]);

  // Fetch all polls
  useEffect(() => {
    async function fetchPolls() {
      try {
        const response = await fetch('http://localhost:3001/api/polls');
        if (!response.ok) throw new Error('Failed to load polls');
        const data = await response.json();
        setPolls(data);
      } catch (error) {
        console.error(error.message);
      }
    }

    fetchPolls();
  }, []);

  // Fetch vote count for a poll
  const fetchVoteCount = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/poll/${id}/votes`);
      if (!response.ok) throw new Error('Failed to load vote count');
      const data = await response.json();
      setVoteCount(data);
    } catch (error) {
      console.error(error.message);
    }
  };

  // Handle creating a poll
  const handleCreatePoll = async () => {
    try {
      const optionsData = JSON.stringify(options.filter((option) => option.trim() !== ''));
      const response = await fetch('http://localhost:3001/api/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options: optionsData })
      });
      if (!response.ok) throw new Error('Failed to create poll');
      const data = await response.json();
      setPolls([...polls, { id: data.id, question, options }]);
    } catch (error) {
      console.error(error.message);
    }
  };

  // Handle voting on a poll
  const handleVote = async (id, optionIndex) => {
    try {
      await fetch(`http://localhost:3001/api/poll/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex })
      });
      const data = voteCount.map((count, index) => (index === optionIndex ? count + 1 : count));
      setVoteCount(data);
      alert('Thank you for voting!');
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h1>Poll App</h1>
      <h2>Create a New Poll</h2>
      <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter question" />
      {options.map((option, index) => (
        <>
          <input
            key={index}
            type="text"
            value={option}
            onChange={(e) => setOption(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
          />
          {options.length > 1 && (
            <button onClick={() => setOptions(options.filter((_, i) => i !== index))}>Remove</button>
          )}
        </>
      ))}
      <button onClick={() => setOptions([...options, ''])}>Add Option</button>
      <button onClick={handleCreatePoll}>Save Poll</button>

      {polls.map((poll) => (
        <div key={poll.id} style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h3>{poll.question}</h3>
          {JSON.parse(poll.options).map((option, index) => (
            <div key={index}>
              <input
                type="radio"
                name={poll.id}
                checked={voteCount[index] === 1}
                onChange={() => handleVote(poll.id, index)}
                disabled
              />
              {option} ({voteCount[index]})
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default App;
