import React, { useState } from 'react';

const App = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ longUrl }),
    });
    const data = await res.json();
    setShortUrl(data.shortUrl);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>URL Shortener</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="Enter a long URL..."
          required
        />
        <button type="submit">Shorten URL</button>
      </form>
      {shortUrl && (
        <div style={{ margin: '20px 0' }}>
          Short URL: <a href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a>
        </div>
      )}
    </div>
  );
};

export default App;
