import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  async function handleShortenClick() {
    try {
      const response = await axios.post('http://localhost:5000/shorten', { long_url: longUrl });
      setShortUrl(response.data.short_url);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>URL Shortener</h1>
      <input
        type="text"
        value={longUrl}
        onChange={(e) => setLongUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <button onClick={handleShortenClick}>shorten</button>
      {shortUrl && <p>Shortened URL: <a href={`${shortUrl}/redirect`} target="_blank" rel="noreferrer">{shortUrl}</a></p>}
    </div>
  );
}

export default App;
