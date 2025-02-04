const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: false
    },
    postImages: {
        type: String,
        required: false
    },
    selectedImages:{
        type: [String],
        required: false
    },
    scheduled: {
        type: Boolean,
        required: false
    },
    posted: {
        type: Boolean,
        required: false
    },
    scheduledDate: {
        type: Date,
        required: false
    },
    postedDate: {
        type: Date,
        required: false
    },
});

const postBunchSchema = new Schema({
    posts: [postSchema],
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    clerkRef: {
        type: String,
        required: true
    },
});

const Post = mongoose.model('Post', postSchema);
const PostBunch = mongoose.model('PostBunch', postBunchSchema);
module.exports = { Post, PostBunch };