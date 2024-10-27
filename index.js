require('dotenv').config();
const express = require('express');
const app = express();
const SERVER_PORT = process.env.SERVICE_PORT;


app.get('/', (req, res) => {
    res.send("server is up");
})



app.listen(SERVER_PORT, () => {
    console.log(`server is runing on port: ${SERVER_PORT}`)
})

