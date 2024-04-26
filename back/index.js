const express = require('express');
const app = express();
const port = 3001;
const bodyParser = require('body-parser');
const path = require('path');
const router = require('./routes/myroutes');
const mailCodeRouter = require('./routes/mailCode');
const sequelize = require('./database');
const cors = require('cors');


sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});

app.use(bodyParser.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.get('/index', async (req, res) => {
  const users = await sequelize.query('SELECT * FROM VOYAGEURS');
  console.log(users);
  res.send('Hello from Node.js!');
  // res.send(`Server is running on port ${port}`);
});

// Serve static files from the React app
// app.use(express.static(path.join(__dirname, 'front/src')));

// Include your routes
// const myRoutes = require('../routes/myRoutes.js');

// // Use my routes
app.use('/api', router);

app.use('/uploads', express.static('uploads'));

// Handle other routes by serving the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/src', 'App.js'));
});

const PORT = process.env.PORT || port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}, triple monnnnstre`);
});