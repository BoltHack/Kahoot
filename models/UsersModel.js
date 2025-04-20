const {Schema, model} = require("mongoose");

const currentDate = new Date();

const year = currentDate.getFullYear();
const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
const day = currentDate.getDate().toString().padStart(2, '0');

const dateOnly = `${day}.${month}.${year}`;

const MyGamesSchema = new Schema({
    gameId: { type: String },
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

const UsersSchema = new Schema({
    name: {
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
    }
});

const UsersModel = model('user', UsersSchema);

module.exports = {UsersModel}