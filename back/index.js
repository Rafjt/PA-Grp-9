const express = require('express');
const app = express();
const port = 3001;
const bodyParser = require('body-parser');
const path = require('path');
const router = require('./routes/myroutes');
const auth = require('./routes/auth');
const mailCodeRouter = require('./routes/mailCode');
const userRoutes = require('./routes/userRoutes');
const sequelize = require('./database');
const cors = require('cors');
const session = require('express-session');


sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});

app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.get('/index', async (req, res) => {
  const users = await sequelize.query('SELECT * FROM VOYAGEURS');
  console.log(users);
  res.send('Hello from Node.js!');
  // res.send(`Server is running on port ${port}`);
});

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false , sameSite: 'lax', httpOnly: false, maxAge: 60*60000}, // Set secure to true if you're using HTTPS
}));

const verifySession = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }
  next();
};

// app.use('/api', verifySession);

app.use('/api', router);

app.use('/auth', auth);

app.use('/uploads', express.static('uploads'));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../front/src', 'App.js'));
// });

const PORT = process.env.PORT || port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


