const express = require('express');
const router = express.Router();
const { generatePosts } = require('../controllers/postController');

// POST /api/posts/generate
router.post('/generate', generatePosts);

module.exports = router;