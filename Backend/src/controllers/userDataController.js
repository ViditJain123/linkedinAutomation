const User = require('../models/userDataModel');

const getUserData = async (req, res) => {
    try {
        const userData = await userSchema.findById(req.body.id);
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createUserData = async (req, res) => {
    const userData = new User({
        clerkRef: req.body.clerkRef,
        niche: req.body.niche,
        linkedinURL: req.body.linkedinURL,
        linkedinAudience: req.body.linkedinAudience,
        narative: req.body.narative,
        postExamples: req.body.postExamples,
        subscription: req.body.subscription
    })
    try {
        const newUser = await userData.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUserData = async (req, res) => {
    try {
        const userData = await userSchema.findById(req.body.id);
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        userData.linkedinURL = req.body.linkedinURL;
        userData.linkedinAudience = req.body.linkedinAudience;
        userData.narative = req.body.narative;
        userData.postExamples = req.body.postExamples;
        userData.niche = req.body.niche;

        const updatedUser = await userData.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteUserData = async (req, res) => {
    try {
        const userData = await userSchema.findById(req.body.id);
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        await userData.remove();
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getUserData, createUserData, updateUserData, deleteUserData };