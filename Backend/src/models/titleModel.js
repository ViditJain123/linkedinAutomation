const mongoose = require('mongoose');
const { title } = require('process');
const Schema = mongoose.Schema;

const titleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    selected: {
        type: Boolean,
        required: true,
        default: false
    }
});

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    titles: {
        type: [titleSchema],
        required: true
    }
});

const titlesSchema = new Schema({
    categories: {
        type: [categorySchema],
        required: true
    },
    clerkRef: {
        type: String,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    customTitles: {
        type: [titleSchema],
        default: []
    },
    generationStage: {
        type: Boolean,
        required: true,
        default: false
    }
});

const TitlesModel = mongoose.model('Titles', titlesSchema);
module.exports = TitlesModel;