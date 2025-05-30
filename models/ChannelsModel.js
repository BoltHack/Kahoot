const { Schema, model } = require("mongoose");

const currentDate = new Date();

const messagesSchema = new Schema({
    id: {
        type: String
    },
    name: {
        type: String
    },
    message: {
        type: String
    },
    date: {
        type: String,
        default: currentDate
    }
});

const usersSchema = new Schema({
    id: {
        type: String
    },
    name: {
        type: String
    }
})

const ChannelSchema = new Schema({
    channelUsers: {
        type: [usersSchema]
    },
    messages: {
        type: [messagesSchema]
    },
    date: {
        type: String,
        default: currentDate
    }
});

const ChannelsModel = model('channel', ChannelSchema);

module.exports = { ChannelsModel };