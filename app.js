
const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const restaurantsRoutes = require('./routes/restaurantsRoutes');
const foodMenuRoutes = require('./routes/foonMenuRoutes');
const db = require('./db/db');

const app = express();
const server  = http.createServer(app);

dotenv.config()
const { PORT } = process.env;
const port = process.env.PORT || PORT;

app.use(express.json());
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/restaurants', restaurantsRoutes);
app.use('/foodMenu', foodMenuRoutes);

//server listening
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});