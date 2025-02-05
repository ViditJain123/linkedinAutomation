const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const dbConnect = require('./config/dbConnect');
const userroute = require('./routes/userroute');
const usercheckroute = require('./routes/usercheckroute');
const titleStoreRoute = require('./routes/titleStoreRoute');
const postStoreRoute = require('./routes/postStoreRoute');
const { initSocket } = require('./socket/socket');
const http = require('http');

const app = express();

const server = http.createServer(app);

initSocket(server);
dotenv.config();

const PORT = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5123', // Must match your client
  credentials: true
}));

dbConnect();

app.use('/api/userdata', userroute);
app.use('/api/usercheck', usercheckroute);
app.use('/api/titles', titleStoreRoute);
app.use('/api/post', postStoreRoute);

server.on('upgrade', (request, socket, head) => {
  console.log('Upgrade request received');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});