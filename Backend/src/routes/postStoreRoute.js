const express = require('express');
const router = express.Router();
const { getPostBunch, createPostBunch, updatePostBunchTitles } = require('../controllers/postStoreController');

// Update the routes to be more RESTful
router.post('/getpostbunch', getPostBunch);
router.post('/createpostbunch', createPostBunch);
router.post('/updatepostbunch', updatePostBunchTitles);  // Changed from PUT to POST for consistency

module.exports = router;
