const router = require('express').Router();
const {getUserData, createUserData, updateUserData, deleteUserData} = require('../controllers/userDataController');

router.get('/', getUserData);
router.post('/', createUserData);
router.put('/', updateUserData);
router.delete('/', deleteUserData);

module.exports = router;