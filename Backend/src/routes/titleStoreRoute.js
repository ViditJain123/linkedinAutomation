const express = require('express');
const router = express.Router();
const { createTitlesForUser, getTitlesForUser } = require('../controllers/titleStoreController');
// ...existing code...

router.get('/', getTitlesForUser);
router.post('/generateTitles', createTitlesForUser);

module.exports = router;
