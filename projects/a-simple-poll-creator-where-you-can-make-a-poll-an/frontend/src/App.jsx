import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [polls, setPolls] = useState([]);
  const [currentPollId, setCurrentPollId] = useState(null);
  const [voting, setVoting] = useState(false);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetchAllPolls();
  }, []);

  async function fetchAllPolls() {
    try {
      const response = await axios.get('/api/polls');
      setPolls(response.data);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  }

  async function createPoll(newOptions) {
    try {
      await axios.post('/api/polls', { options });
      fetchAllPolls();
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  }

  async function castVote(pollId, optionIndex) {
    setVoting(true);
    const updatedOptions = [...options];
    updatedOptions[optionIndex]++;
    try {
      await axios.put(`/api/polls/${pollId}`, { options: updatedOptions });
      fetchAllPolls();
    } catch (error) {
      console.error('Error casting vote:', error);
    } finally {
      setVoting(false);
      setCurrentPollId(null);
    }
  }

  return (
    <div>
      Title:
      <br />
      Options:
      <div>
        {(options.length > 0
          ? options
          : Array(4)
              .fill()
              .map((_, i) => `Option ${i + 1}`)
        ).map((option, index) => (
          <input key={index} type="radio" name="vote" onChange={() => setCurrentPollId(index)} />
          Option {index + 1}
          <br />
        ))}
      </div>
      <button onClick={() => createPoll({ options })}>Create Poll</button>

      {polls.length > 0 && (
        <>
          <h2>Polls:</h2>
          <select
            onChange={(e) => setCurrentPollId(parseInt(e.target.value))}
            disabled={!options.length || voting}
          >
            {polls.map((poll, index) => (
              <option key={index} value={index}>
                Poll {index + 1} - Votes: {poll.options.join(', ')}
              </option>
            ))}
          </select>
          {currentPollId !== null && options.length > 0 ? (
            <>
              Voting...
              <br />
              Vote on:
              {voting ? (
                <button onClick={() => castVote(currentPollId, currentPollId)}>Submit</button>
              ) : (
                'You have already voted!'
              )}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

export default App;
