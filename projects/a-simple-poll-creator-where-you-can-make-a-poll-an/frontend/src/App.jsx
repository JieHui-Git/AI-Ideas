import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    const response = await axios.get('http://localhost:5000/polls');
    setPolls(response.data);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Poll Creator</h2>
      </header>
      <main>
        {polls.map((poll) => (
          <div key={poll.id}>
            <h3>{poll.question}</h3>
            {poll.choices.map((choice, index) => (
              <p key={index}>
                {choice.title}: {choice.votes}
              </p>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
