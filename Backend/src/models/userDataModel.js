const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    clerkRef: {
        type: String,
        required: true,
        unique: true
    },
    niche: {
        type: String,
        required: true
    },
    linkedinURL: {
        type: String,
        required: true
    },
    linkedinAudience: {
        type: String,
        required: true
    },
    narative: {
        type: String,
        required: true
    },
    postExamples: {
        type: [String],
        required: true
    },
    subscription: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('User', userSchema);