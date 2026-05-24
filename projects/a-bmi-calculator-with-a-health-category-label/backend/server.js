const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the frontend dir
app.use(express.static('frontend'));

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
