const express = require('express');
const router = express.Router();
const { createTitlesForUser, getTitlesForUser } = require('../controllers/titleStoreController');
// ...existing code...

// Changed GET to POST: was: router.get('/', getTitlesForUser);
router.post('/gettitles', getTitlesForUser);
router.post('/generateTitles', createTitlesForUser);

module.exports = router;
