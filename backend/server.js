const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const cors = require('cors');
const dotenv = require('dotenv/config')
const PORT = process.env.PORT || 5002
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const profileRoutes = require('./routes/profileRoutes')
const jwt = require('jsonwebtoken')

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"],
    },
})

const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
} else {
    console.log('Uploads directory already exists');
}


app.use(cors());
app.use(express.json());
app.use('/api/user', authRoutes);
app.use('/api/user', profileRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

io.use((socket, next) => {
    const token = socket.handshake.query.token;
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.decoded = decoded;
      next();
    });
  }).on('connection', (socket) => {
    console.log('A user connected', socket.decoded);
  
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
  
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));
  
  server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
  });