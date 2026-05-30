import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs-extra';

const app = express();
app.use(bodyParser.json());

const PORT = 5000;

// Function to read data from a JSON file or return an empty array if it doesn't exist
async function readData(filePath) {
  try {
    const data = await fs.readJson(filePath);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error reading data:', err);
    return [];
  }
}

// Function to write data to a JSON file
async function writeData(filePath, data) {
  try {
    await fs.writeJson(filePath, data, { spaces: 2 });
  } catch (err) {
    console.error('Error writing data:', err);
  }
}

app.post('/api/polls', async(req, res) => {
  const newPoll = req.body;
  let polls = await readData('./polls.json');
  newPoll.id = polls.length + 1;
  polls.push(newPoll);
  await writeData('./polls.json', polls);
  res.status(201).send(newPoll);
});

app.get('/api/polls', async (req, res) => {
  const polls = await readData('./polls.json');
  res.send(polls);
});

app.post('/api/vote/:pollId/:option', async (req, res) => {
  const { pollId, option } = req.params;
  let polls = await readData('./polls.json');
  
  const poll = polls.find(p => p.id === parseInt(pollId));
  if (!poll) return res.status(404).send({ error: 'Poll not found' });

  const existingOption = poll.options.find(opt => opt.text === option);
  if (existingOption) {
    existingOption.votes++;
  } else {
    poll.options.push({ text: option, votes: 1 });
  }

  await writeData('./polls.json', polls);
  res.send(poll);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
