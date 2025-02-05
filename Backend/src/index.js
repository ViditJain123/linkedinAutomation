const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const dbConnect = require('./config/dbConnect');
const userroute = require('./routes/userroute');
const usercheckroute = require('./routes/usercheckroute');
const titleStoreRoute = require('./routes/titleStoreRoute');
const postStoreRoute = require('./routes/postStoreRoute');

const app = express();
dotenv.config();

const PORT = 3000;

app.use(express.json());
app.use(cors());

dbConnect();

app.use('/api/userdata', userroute);
app.use('/api/usercheck', usercheckroute);
app.use('/api/titles', titleStoreRoute);
app.use('/api/post', postStoreRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});