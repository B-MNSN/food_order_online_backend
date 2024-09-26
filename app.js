
const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv')

const app = express();
const server  = http.createServer(app);

dotenv.config()
const { PORT } = process.env;
const port = process.env.PORT || PORT;

app.use(express.json());
app.use(cors());

//server listening
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});