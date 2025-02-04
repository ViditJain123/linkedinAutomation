const express = require('express');
const router = express.Router();
const { getOrCreatePostBunch } = require('../controllers/postStoreController');

// ...existing route definitions...

router.post('/postbunch', getOrCreatePostBunch);

module.exports = router;
