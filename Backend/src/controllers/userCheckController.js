const User = require('../models/userDataModel');

const checkUserData = async (req, res) => {
    try {
        const userData = await User.findOne({ clerkRef: req.body.clerkRef });
        if (!userData) {
            return res.status(200).json({ success: false });
        }
        if (userData) {
            return res.status(200).json({ success: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { checkUserData };