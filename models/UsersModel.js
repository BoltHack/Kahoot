const {Schema, model} = require("mongoose");

const currentDate = new Date();

const year = currentDate.getFullYear();
const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
const day = currentDate.getDate().toString().padStart(2, '0');

const dateOnly = `${day}.${month}.${year}`;

const MyGamesSchema = new Schema({
    gameId: { type: String },
});

const MyChannelsSchema = new Schema({
    channelId: { type: String },
    companionId: { type: String },
    companionName: { type: String },
});

const MyFriendsSchema = new Schema({
    id: { type: String },
    name: { type: String },
    image: { type: String },
});

const GameSchema = new Schema({
    game_id: {
        type: String,
    },
    game_name: {
        type: String,
    },
    game_answers: {
        type: Number,
    },
    game_correct_answers: {
        type: Number
    }
});

const AchievementsSchema = new Schema({
    aName: {
        type: String
    },
    aImage: {
        type: String
    }
});

const UsersSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    friendName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ("/images/defaultUser.png")
    },
    registerDate: {
        type: String,
        default: dateOnly
    },
    refreshToken: {
        type: String
    },
    role: {
        type: String,
        default: 'User'
    },
    ip: {
        type: String,
        default: ''
    },
    myGames: {
        type: [MyGamesSchema],
        default: []
    },
    current_game: {
        type: String,
        default: ''
    },
    game: {
        type: [GameSchema],
        default: []
    },
    myFriends: {
        type: [MyFriendsSchema],
        default: []
    },
    onlineMod: {
        type: String
    },
    settings: {
        notifications: {
            type: String,
            default: 'on'
        },
        soundTrack: {
            type: String,
            default: 'on'
        },
        mainEffects: {
            type: String,
            default: 'on'
        },
        darkTheme: {
            type: String,
            default: 'on'
        },
        status: {
            type: String,
            maxLength: 90
        },
        aboutMe: {
            type: String,
            maxLength: 200
        },
        mainBackgroundImage: {
            type: String,
            default: ("/images/kahoot2.png")
        },
    },
    games_info: {
        lvl: {
            type: Number,
            default: 0
        },
        lvlUp: {
            type: Number,
            default: 0
        },
        wins: {
            type: Number,
            default: 0
        },
        achievements: {
            type: [AchievementsSchema]
        }
    },
    myChannels: {
        type: [MyChannelsSchema],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

    expiresAt: {
        type: Date,
    },
});

UsersSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UsersModel = model('user', UsersSchema);

module.exports = {UsersModel}