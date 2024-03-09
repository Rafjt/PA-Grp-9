const express = require('express');
const app = express();
const port = 3001;
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.json());

app.get('/index', (req, res) => {
  res.send('Hello from Node.js!');
  // res.send(`Server is running on port ${port}`);
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'front/src')));

// Include your routes
// const myRoutes = require('../routes/myRoutes');

// // Use my routes
// app.use('/api', myRoutes);

// Handle other routes by serving the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/src', 'App.js'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});