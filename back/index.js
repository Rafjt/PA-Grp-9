const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const sequelize = require('./database');
const router = require('./routes/myroutes');
const auth = require('./routes/auth');
const abonnement = require('./routes/abonnementRoute');
require('dotenv').config();
const allowedOrigins = process.env.PCS_URL;

const port = 3001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});

app.use(bodyParser.json());

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, sameSite: 'lax', httpOnly: false, maxAge: 60*60000 } // Set secure to true if you're using HTTPS
}));

app.use('/api', router);
app.use('/auth', auth);
app.use('/abonnement', abonnement);

app.use('/uploads', express.static('uploads'));

io.on('connection', (socket) => {
  socket.on('createRoom', (data) => {
    const roomName = data.roomName;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room ${roomName}`);
  });

  socket.on('envoieMsg', (msg) => {
    socket.broadcast.emit('msgRecu', msg);
    console.log(`Message: ${msg.message}`);
  });

  socket.on('disconnect', () => {
    console.log(`user ${socket.id} disconnected`);
  });
});

app.get('/index', async (req, res) => {
  const users = await sequelize.query('SELECT * FROM VOYAGEURS');
  console.log(users);
  res.send('Hello from Node.js!');
});

const PORT = process.env.PORT || port;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
