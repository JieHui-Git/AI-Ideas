import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [polls, setPolls] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);
  const [selectedPoll, setSelectedPoll] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await axios.get('http://localhost:8000/polls/');
      setPolls(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNewQuestionChange = (e) => {
    setNewQuestion(e.target.value);
  };

  const handleOptionChange = (index) => (e) => {
    const newOptionsCopy = [...newOptions];
    newOptionsCopy[index] = e.target.value;
    setNewOptions(newOptionsCopy);
  };

  const addOption = () => {
    setNewOptions([...newOptions, '']);
  };

  const createPoll = async () => {
    try {
      await axios.post('http://localhost:8000/polls/', {
        question: newQuestion,
        options: newOptions.filter(opt => opt.trim() !== ''),
      });
      fetchPolls();
      setNewQuestion('');
      setNewOptions(['', '']);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVote = async (pollId, option) => {
    try {
      await axios.post(`http://localhost:8000/votes/${pollId}/${option}`);
      fetchPolls();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Poll Creator</h1>
      <div>
        <input
          type="text"
          value={newQuestion}
          onChange={handleNewQuestionChange}
          placeholder="Enter question"
        />
        {newOptions.map((option, index) => (
          <div key={index}>
            <input
              type="text"
              value={option}
              onChange={handleOptionChange(index)}
              placeholder={`Option ${index + 1}`}
            />
            {index === newOptions.length - 1 && (
              <button onClick={addOption}>Add Option</button>
            )}
          </div>
        ))}
        <button onClick={createPoll}>Create Poll</button>
      </div>
      <h2>Polls</h2>
      {polls.map(poll => (
        <div key={poll.id}>
          <h3>{poll.question}</h3>
          <ul>
            {Object.entries(poll.votes).map(([option, count]) => (
              <li key={option}>
                {option}: {count} votes
                <button onClick={() => handleVote(poll.id, option)}>Vote</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default App;
