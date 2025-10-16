const { Schema, model } = require("mongoose");

const currentDate = new Date();

const year = currentDate.getFullYear();
const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
const day = currentDate.getDate().toString().padStart(2, '0');

const dateOnly = `${day}.${month}.${year}`;

const tagsSchema = new Schema({
    tagName: {
        type: String,
        required: true
    }
});

const newsSchema = new Schema({
    author: {
        authorName: {
            type: String,
        },
        authorId: {
            type: String,
        },
    },
    mainContent: {
        mainTitle: {
            type: String
        },
        mainSummary: {
            type: String
        },
        mainImage: {
            type: String,
            default: ''
        },
    },
    content: {
        type: String
    },
    views: {
        type: Number,
        default: 0
    },
    tags: {
        type: [tagsSchema],
    },
    reactions: {
        likes: [{
            type: [String],
            default: []
        }],
        dislikes: [{
            type: [String],
            default: []
        }]
    },
    isVisibility: {
        type: Boolean,
        default: true
    },
    date: {
        type: String,
        default: dateOnly
    },
    fullDate: {
        type: Date,
        default: currentDate
    }
});

newsSchema.index({ fullDate: -1 });
newsSchema.index({ 'tags.tagName': -1 });

const NewsModel = model('news', newsSchema);

module.exports = { NewsModel };