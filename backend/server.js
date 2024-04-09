const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const cors = require('cors');
const dotenv = require('dotenv/config')
const PORT = process.env.PORT || 5002

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"],
    },
})

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

io.on('connection', (socket) => {
    console.log('A user connected')

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    })

    socket.on('disconnect', () => {
        console.log('User disconnected')
    })
})

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})