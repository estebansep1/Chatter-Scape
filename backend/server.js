const dotenv = require('dotenv/config')

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5002

require('dotenv').config();

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})