import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [polls, setPolls] = useState([]);
  const [newPollName, setNewPollName] = useState('');
  const [newOption, setNewOption] = useState('');

  // Fetch polls data when the component mounts
  useEffect(() => {
    axios.get('http://localhost:5000/api/polls')
      .then(response => {
        setPolls(response.data);
      })
      .catch(error => console.error('Error fetching polls:', error));
  }, []);

  // Handle form submission to create a new poll
  const handleAddPoll = async () => {
    if (!newPollName || !newOption) return;
    
    try {
      await axios.post('http://localhost:5000/api/polls', { name: newPollName, options: [{ text: newOption, votes: 0 }] });
      
      // Fetch the updated polls list
      const response = await axios.get('http://localhost:5000/api/polls');
      setPolls(response.data);

      // Reset form inputs
      setNewPollName('');
      setNewOption('');
    } catch (error) {
      console.error('Error adding poll:', error);
    }
  };

  return (
    <div>
      <h1>Poll Creator</h1>
      <form onSubmit={e => e.preventDefault()}>
        <input 
          type="text" 
          placeholder="Poll Name" 
          value={newPollName} 
          onChange={e => setNewPollName(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Option Text" 
          value={newOption} 
          onChange={e => setNewOption(e.target.value)} 
        />
        <button onClick={handleAddPoll}>Create Poll</button>
      </form>

      {polls.map(poll => (
        <div key={poll.id}>
          <h2>{poll.name}</h2>
          <ul>
            {poll.options.map(option => (
              <li key={option.text}>
                {option.text} - Votes: {option.votes}
                <button onClick={async () => {
                  try {
                    await axios.post(`http://localhost:5000/api/vote/${poll.id}/${option.text}`);
                    
                    // Fetch the updated polls list
                    const response = await axios.get('http://localhost:5000/api/polls');
                    setPolls(response.data);
                  } catch (error) {
                    console.error('Error voting:', error);
                  }
                }}>Vote</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default App;
