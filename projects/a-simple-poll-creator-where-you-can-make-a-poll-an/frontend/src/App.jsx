import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PollCreator() {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [polls, setPolls] = useState([]);

  const addOption = () => setOptions(prev => [...prev, '']);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const res = await axios.get('http://localhost:3001/polls');
      setPolls(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createPoll = async () => {
    try {
      const res = await axios.post('http://localhost:3001/polls', { title, options });
      setPolls(prevPolls => [...prevPolls, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Poll Creator</h1>
      <input 
        type="text" 
        placeholder="Enter poll title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <button onClick={addOption}>Add Option</button>
      {options.map((option, index) => (
        <div key={index}>
          <input 
            type="text" 
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) => setOptions(prev => {
              const newOptions = [...prev];
              newOptions[index] = e.target.value;
              return newOptions;
            })}
          />
        </div>
      ))}
      <button onClick={createPoll}>Create Poll</button>

      {polls.map(poll => (
        <div key={poll.id}>
          <h2>{poll.title}</h2>
          {JSON.parse(poll.options).map((opt, index) => (
            <p key={index}>{`${opt}: Votes`}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default PollCreator;
