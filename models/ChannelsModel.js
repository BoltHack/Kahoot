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
    edited: {
        type: Boolean
    },
    reply: [
        {
            msgId: {
                type: String,
            },
            toWho: {
                type: String
            },
            id: {
                type: String
            },
            name: {
                type: String,
            },
            message: {
                type: String,
            }
        }
    ],
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
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ChannelsModel = model('channel', ChannelSchema);

module.exports = { ChannelsModel };