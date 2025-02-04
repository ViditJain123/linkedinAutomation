const router = require('express').Router();
const {checkUserData} = require('../controllers/userCheckController');

router.post('/', checkUserData);

module.exports = router;