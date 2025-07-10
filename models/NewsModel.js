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
})

const updateSchema = new Schema({
    title: {
        type: String
    },
    image: {
        type: String
    },
    content: {
        type: String
    },
})

const newsSchema = new Schema({
    author: {
        authorName: {
            type: String,
        },
        authorId: {
            type: String,
        },
    },
    updateTitle: {
        type: String
    },
    update: {
        type: [updateSchema]
    },
    views: {
        type: Number,
        default: 0
    },
    tags: {
        type: [tagsSchema],
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