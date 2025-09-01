const createError = require('http-errors');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fileUpload = require('express-fileupload');
const start = require('./services/db');
const indexRouter = require('./routes/index');
const http = require("http");
const socketIo = require('socket.io');
const sanitizeHtml = require("sanitize-html");
const axios = require('axios');
const errorHandler = require('./middlewares/errorHandler');
const { GamesModel } = require('./models/GamesModel');
const { UsersModel } = require('./models/UsersModel');
const { ChannelsModel } = require('./models/ChannelsModel');
const { NewsModel } = require('./models/NewsModel');
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let gameUsers = {};
let challengeCompleted = {};

let timers = {};
let leaderTimers = {};
io.on('connection', async (socket) => {
    console.log('Новый пользователь подключился');
    async function funcCheckGameOnline(socket, gameId) {
        try {
            const game = await GamesModel.findById(gameId);
            if (!game) return;

            setTimeout(async () => {
                console.log('online:', game.game_online.online);
                const gameOnline = Number(game.game_online.online);

                if (gameOnline < 2) {
                    io.to(gameId).emit('updateGameCount', 'Default');
                    if (timers[gameId.toString()]) {
                        clearTimeout(timers[gameId.toString()]);
                        delete timers[gameId.toString()];
                    }
                }
                else if (gameOnline >= 2 && game.game_start_type === 'Auto') {
                    await funcGameStart(socket, 'Auto', gameId);
                } else {
                    io.to(gameId).emit('updateGameCount', 'Wait');
                    if (timers[gameId.toString()]) {
                        clearTimeout(timers[gameId.toString()]);
                        delete timers[gameId.toString()];
                    }
                }
            }, 2000);
        } catch (error) {
            console.log('error', error);
        }
    }

    async function funcGameStart(socket, type, gameId) {
        try {
            const gameInfo = await GamesModel.findById(gameId);
            console.log('Старт!');
            const allUserId = gameInfo.game_users.map(u => u.userId.toString());
            await UsersModel.updateMany(
                { _id: { $in: allUserId } },
                {
                    $set: { 'game.0.game_answers': 0, 'game.0.game_correct_answers': 0 }
                },
                { new: true }
            );

            if (type === 'Auto') {
                if (gameInfo.game_start_type === 'Auto' && gameInfo.game_online.online >= 2 && gameInfo.game_type !== 'Close') {
                    console.log('autoStart')
                    if (!timers[gameId.toString()] && gameInfo.game_type !== 'Close' && gameInfo.game_online.online > 1) {
                        io.to(gameId).emit('updateGameCount');
                        await startCountdown(socket, gameId, 10);
                    }
                }
            } else if (type === 'Manual') {
                if (!timers[gameId.toString()] && gameInfo.game_type !== 'Close') {
                    io.to(gameId).emit('updateGameCount');
                    await startCountdown(socket, gameId, 10);
                }
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    async function startCountdown(socket, gameId, startTime) {
        try {
            if (timers[gameId.toString()]) {
                clearTimeout(timers[gameId.toString()]);
                delete timers[gameId.toString()];
            }

            const gameInfo = await GamesModel.findById(gameId);

            if (gameInfo.game_online.online < 2) return;

            let timeLeft = startTime;

            if (gameInfo.game_type !== 'Close') {
                const tick = async () => {
                    if (timeLeft <= -1) {
                        clearTimeout(timers[gameId.toString()]);
                        delete timers[gameId.toString()];

                        console.log(`Game ${gameId}: finish`);
                        await funcGameClose(socket, gameId);
                        await startGameLeaderTimer(gameId);
                        io.to(gameId).emit('requestGetQuestions', gameInfo.game_questions[0]);
                        return;
                    }
                    console.log(`Game ${gameId}: timer:`, timeLeft);
                    io.to(gameId).emit('startCountdown', timeLeft);
                    timeLeft--;

                    timers[gameId.toString()] = setTimeout(tick, 1000);
                }
                await tick();
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    async function startGameLeaderTimer(gameId) {
        try {
            console.log('leader timer start');
            if (leaderTimers[gameId]?.timer) {
                clearTimeout(leaderTimers[gameId].timer);
                delete leaderTimers[gameId];
            }

            leaderTimers[gameId] = { timePassed: 0, timer: null };

            const tick = async () => {
                const gameInfo = await GamesModel.findById(gameId);

                if (gameInfo.game_leaders.length === gameInfo.game_users.length || gameInfo.game_online.online < 2) {
                    clearTimeout(leaderTimers[gameId].timer);
                    delete leaderTimers[gameId];
                    return;
                }
                console.log(`Game ${gameId}: leader timer:`,  leaderTimers[gameId].timePassed);

                leaderTimers[gameId].timePassed++;
                leaderTimers[gameId].timer = setTimeout(tick, 1000);
            }
            await tick();

        } catch (error) {
            console.log('error', error);
        }
    }

    async function getCurrentTimer(gameId) {
        const time = leaderTimers[gameId]?.timePassed ?? 0;
        return time;
    }

    async function funcGameClose(socket, gameId) {
        try {
            const updateGameTypeCount = await GamesModel.findById(gameId);

            await GamesModel.updateOne(
                { _id: gameId },
                { $set: { game_type: 'Close' } }
            );
            console.log('the game is closed.');
            io.to(gameId).emit('updateGameTypeCount', updateGameTypeCount.game_type);
            io.to(gameId).emit('questionTimerStart');
        } catch (error) {
            console.log('error', error);
        }
    }

    async function funcAnswersCount(userId) {
        const updateAnswers = await UsersModel.findById(userId);
        socket.emit('updateAnswersCount', updateAnswers.game);
    }

    socket.on('disconnect', async () => {
        const { gameId, userId, userName } = socket;
        const game_max_online = await GamesModel.findById(gameId);

        if (!gameId || !userId) {
            console.error('Ошибка: не переданы gameId или userId');
            return;
        }

        if (gameUsers[gameId]) {
            gameUsers[gameId] = gameUsers[gameId].filter(id => id !== userId);
        }

        console.log(`Пользователь ${userId}(${userName}) покинул игру ${gameId}.`);

        try {
            let game;
            const gameInfo = await GamesModel.findById(gameId);

            game = await GamesModel.findOneAndUpdate(
                { _id: gameId },
                {
                    $inc: { 'game_online.online': -1 },
                    $pull: {
                        'game_online.users': { userId },
                        'game_users': { userId: userId },
                        'game_leaders': { id: userId }
                    },
                },
                { new: true }
            );

            await funcCheckGameOnline(socket, gameId);

            if (game.game_online?.users.length === 0){
                await GamesModel.findOneAndUpdate(
                    { _id: gameId },
                    {
                        $set: {
                            expiresInMinutes: 60,
                            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                            'game_type': 'Open',
                            'game_leaders': [],
                            'game_online.online': 0,
                            'winnerSet': []
                        }
                    },
                    { new: true }
                );
            }

            socket.emit('updateUserCount', game.game_online);

            if (gameInfo.game_leaders.length === 0) {
                setTimeout(function () {
                    io.emit('stopTimer');
                }, 500);
                await GamesModel.findOneAndUpdate(
                    { _id: gameId },
                    {
                        $set: {
                            'game_type': 'Open',
                        }
                    },
                    { new: true }
                );
            }
            if (gameInfo.game_leaders.length > 0 && gameInfo.game_online.users.length !== 1) {
                setTimeout(function () {
                    io.emit('stopTimer');
                }, 500);
                if (gameInfo.game_online.users.length !== gameInfo.game_leaders.length) {
                    io.to(gameId).emit('earlyCall-requestLeadersCount');
                }
            }
            if (gameInfo.game_users.length < 2) {
                socket.emit('stopTimer');
            }
            else {
                setTimeout(function () {
                    io.emit('stopTimer');
                }, 500);
            }

            if (game) {
                console.log(`Отправка обновления для игры ${gameId}, онлайн1: ${game.game_online.online}. Лимит онлайна: ${game_max_online.game_online.max_online}`);
                io.to(gameId).emit('updateUserCount', game.game_online);
            } else {
                console.error('Игра не найдена!');
            }
        } catch (err) {
            console.error('Ошибка при обновлении данных игры:', err);
        }

        socket.leave(gameId);
    });

    socket.on('joinGame', async (gameId, userId, userName) => {
        const game_max_online = await GamesModel.findById(gameId);
        const updateAnswers = await UsersModel.findById(userId);
        const game_questions = await GamesModel.findById(gameId)
        const checkUserBanned = await GamesModel.findById(gameId);
        const updateGameTypeCount = await GamesModel.findById(gameId);

        if (!gameUsers[gameId]) {
            gameUsers[gameId] = [];
        }

        gameUsers[gameId].push(userId);
        console.log(`Пользователь ${userId}(${userName}) присоединился к игре ${gameId}.`);
        socket.gameId = gameId;
        socket.userId = userId;
        socket.userName = userName;


        try {
            const userInfo = await UsersModel.findById(userId);
            const userImage = userInfo.image;
            const game = await GamesModel.findOne({ _id: gameId });

            if (!game) {
                console.error('Игра не найдена!');
                socket.emit('error', 'Игра не существует');
                return;
            }

            if (!Array.isArray(game.game_online.users)) {
                game.game_online.users = [];
                await game.save();
            }

            let updatedGame = await GamesModel.findOneAndUpdate(
                { _id: gameId },
                {
                    $inc: { 'game_online.online': 1 },
                    $push: { 'game_online.users': { userId, userName, userImage }, 'game_users': {userId} },
                },
                { new: true }
            );
            await funcCheckGameOnline(socket, gameId);
            await GamesModel.updateMany({ _id: gameId }, { $unset: { expiresInMinutes: 1, expiresAt: 1 } });

            socket.emit('updateUserCount', updatedGame.game_online);
            socket.emit('updateAnswersCount', updateAnswers.game);
            socket.emit('updateGameQuestions', game_questions);
            socket.emit('updateBannedUsers', checkUserBanned.game_banned_users);
            socket.emit('updateGameTypeCount', updateGameTypeCount.game_type);

            socket.on('requestQuestionTimerStart', async () => {
                const checkPerms = await GamesModel.findById(gameId);
                if (checkPerms.game_author.id === userId) {
                    socket.emit('questionTimerStart');
                }
                else {
                    console.log('нет прав.');
                }
            });

            socket.on('requestAnswersCount', async () => {
                const updateAnswers = await UsersModel.findById(userId);
                socket.emit('updateAnswersCount', updateAnswers.game);
            });

            async function funcLeadersCount() {
                try {
                    const game = await GamesModel.findById(gameId);
                    console.log(
                        'gameId', game.id,
                        'users.length', game.game_online.users.length, '|',
                        'leaders.length', game.game_leaders.length
                    );

                    if (game.game_online.users.length === game.game_leaders.length) {
                        game.game_leaders.sort((a, b) => b.correct_answers - a.correct_answers);

                        for (let index = 0; index < game.game_leaders.length; index++) {
                            console.log('Подчёты...');
                            const leader = game.game_leaders[index];
                            const user = await UsersModel.findById(leader.id);

                            if (!game.winnerSet.includes(user.id)) {
                                await GamesModel.findByIdAndUpdate(gameId, { $push: { winnerSet: user.id } }, {new: true});
                                console.log('Победил:', user.id, '|', user.name, index);

                                const lvlUpPrize = index === 0 ? 1 : index === 1 ? 0.5 : index === 2 ? 0.2 : 0;

                                let updated = await UsersModel.findOneAndUpdate(
                                    { _id: user.id },
                                    {
                                        $inc: { 'games_info.lvlUp': lvlUpPrize },
                                    },
                                    { new: true }
                                );

                                console.log('lvlUp после обновления:', updated.games_info.lvlUp);

                                if (updated.games_info.lvlUp >= 5) {
                                    await UsersModel.findOneAndUpdate(
                                        { _id: user.id },
                                        {
                                            $set: { 'games_info.lvlUp': 0 },
                                            $inc: { 'games_info.lvl': 1 },
                                        },
                                        { new: true }
                                    );
                                }
                                if (index === 0) {
                                    await UsersModel.findOneAndUpdate(
                                        { _id: user.id },
                                        {
                                            $inc: { 'games_info.wins': 1 },
                                        },
                                        { new: true }
                                    );
                                }

                                setTimeout(async () => {
                                    const updatedUser = await UsersModel.findById(updated.id);

                                    if (
                                        updatedUser.games_info.lvl >= 5 &&
                                        !updatedUser.games_info.achievements?.some(a => a.aName === 'achievement1')
                                    ) {
                                        console.log(updatedUser.name, 'Получил Достяжение!');

                                        challengeCompleted[updatedUser.id] = socket.id;
                                        console.log('updatedUser', updatedUser.id);

                                        await UsersModel.findOneAndUpdate(
                                            {_id: updatedUser.id },
                                            {
                                                $push: {
                                                    'games_info.achievements': {aName: 'achievement1', aImage: '/gameAchievements/achievement1.png'},
                                                }
                                            },
                                            { new: true }
                                        );
                                        const winnerId = challengeCompleted[updatedUser.id];
                                        console.log('winner SocketId', winnerId);
                                        if (winnerId) {
                                            io.to(winnerId).emit('challengeComplete1');
                                        }
                                    }
                                }, 1000);
                            }
                        }

                        io.to(gameId).emit('updateLeaderBoard', game.game_leaders);
                        io.to(gameId).emit('openLeadersMenu');
                    } else {
                        console.log('ещё не все закончили');
                    }
                } catch (error) {
                    console.log('error', error);
                }
            }


            socket.on('requestBannedUsersCount', async () => {
                const updateBannedUsersCount = await GamesModel.findById(gameId);
                socket.emit('updateBannedUsersCount', updateBannedUsersCount.game_banned_users);
            });

            socket.on('requestGameTypeCount', async () => {
                socket.emit('updateGameTypeCount', updateGameTypeCount.game_type);
            });

            socket.on('requestStartGame', async () => {
                const checkPerms = await GamesModel.findById(gameId);
                if (checkPerms.game_author.id === userId) {
                    await funcGameStart(socket, 'Manual', gameId);
                }
                else {
                    console.log('нет прав.');
                }
            });

            socket.on('requestGameAccessCount', async () => {
                const updateGameAccessCount = await GamesModel.findById(gameId);
                const updateUserFriendsCount = await UsersModel.findById(userId);
                socket.emit('updateGameAccessCount', {
                    gameData: {
                        userFriends: updateUserFriendsCount.myFriends,
                        gameAccess: updateGameAccessCount.game_access
                    }
                });
            });

            const authorId = userId;
            socket.on('ban', async (userId) => {
                const {gameId} = socket;
                const getUserData = await UsersModel.findById(userId);
                const checkUserPerms = await GamesModel.findById(gameId);

                console.log('authorId', authorId);

                if (checkUserPerms.game_author.id.toString() === authorId.toString()) {
                    const isAlreadyBanned = checkUserPerms.game_banned_users
                        .some(u => u.bannedId.toString() === userId.toString());

                    if (!isAlreadyBanned) {
                        let updateBannedUsers = await GamesModel.findOneAndUpdate(
                            { _id: gameId },
                            {
                                $push: {
                                    "game_banned_users": {bannedId: userId, bannedName: getUserData.name, bannedImage: getUserData.image}
                                }
                            },
                            {new: true}
                        );
                        io.to(gameId).emit('updateBannedUsers', updateBannedUsers.game_banned_users);

                        const bannedSocket = [...io.sockets.sockets.values()]
                            .find(s => s.userId === userId);

                        if (bannedSocket) {
                            bannedSocket.leave(gameId);
                            console.log('ban', userId, 'from', gameId);
                            socket.emit('banBroadcast', {userName: getUserData.name});
                        }

                    }
                }
            });

            socket.on('unban', async (userId) => {
                const { gameId } = socket;
                const getUserData = await UsersModel.findById(userId);
                const checkUserPerms = await GamesModel.findById(gameId);

                if (checkUserPerms.game_author.id.toString() === authorId.toString()) {
                    // alreadyBannedUserIds.splice(userId);
                    let updateBannedUsers = await GamesModel.updateOne(
                        {_id: gameId},
                        {
                            $pull: {
                                game_banned_users: {bannedId: {$in: userId}}
                            }
                        }
                    );
                    console.log('unban', userId);
                    io.to(gameId).emit('updateBannedUsers', updateBannedUsers.game_banned_users);
                    socket.emit('unbanBroadcast', {userName: getUserData.name});
                }
            });

            socket.on('closeGame', async () => {
                await GamesModel.updateOne(
                    { _id: gameId },
                    { $set: { game_type: 'Close' } }
                );
                console.log('the game is closed.');
                socket.emit('updateGameTypeCount', updateGameTypeCount.game_type);
                socket.emit('questionTimerStart');
            })

            socket.on('openGame', async () => {
                await GamesModel.updateOne(
                    { _id: gameId },
                    { $set: { game_type: 'Open' } }
                );

                console.log('the game is open.');
                socket.emit('updateGameTypeCount', updateGameTypeCount.game_type);
            });

            let answeredUsers = {};

            socket.on('gameCheckAnswer', async (data) => {
                try {
                    if (answeredUsers[gameId]?.[userId]) {
                        return;
                    }
                    answeredUsers[gameId] = answeredUsers[gameId] || {};
                    answeredUsers[gameId][userId] = true;

                    let updatedUser;
                    const checkQuestion = await GamesModel.findById(gameId);
                    if (checkQuestion.game_online.online < 2) return;
                    if (checkQuestion.game_questions[data.dataNumber].correct_question === data.dataName) {
                        console.log('Событие получено для пользователя:', userId);
                        updatedUser = await UsersModel.findOneAndUpdate(
                            { _id: userId },
                            {
                                $inc: {
                                    'game.0.game_answers': 1,
                                    'game.0.game_correct_answers': 1,
                                },
                            },
                            { new: true }
                        );
                        socket.emit('gameCorrectAnswer');
                        socket.emit('stopTimer');
                        setTimeout(function () {
                            socket.emit('questionTimerStart', updatedUser.game[0].game_answers);
                            if (checkQuestion.game_questions.length !== data.dataNumber + 1) {
                                socket.emit('requestGetQuestions', checkQuestion.game_questions[data.dataNumber + 1]);
                            } else socket.emit('requestGetQuestions');
                        }, 4000);

                        console.log('checkQuestion.game_questions[data.dataNumber + 1]', checkQuestion.game_questions[data.dataNumber + 1]);
                        answeredUsers[gameId][userId] = false;
                        console.log('Обновлено. Кол-во правильных ответов:', updatedUser.game[0].game_correct_answers);
                    }
                    else {
                        console.log('Событие получено для пользователя:', userId);
                        updatedUser = await UsersModel.findOneAndUpdate(
                            { _id: userId },
                            {
                                $inc: {
                                    'game.0.game_answers': 1,
                                },
                            },
                            { new: true }
                        );

                        console.log('Обновлено. Кол-во ответов:', updatedUser.game[0].game_answers);
                        socket.emit('gameWrongAnswer');
                        socket.emit('stopTimer');
                        setTimeout(function () {
                            socket.emit('questionTimerStart', updatedUser.game[0].game_answers);
                            if (checkQuestion.game_questions.length !== data.dataNumber + 1) {
                                socket.emit('requestGetQuestions', checkQuestion.game_questions[data.dataNumber + 1]);
                            } else socket.emit('requestGetQuestions');
                        }, 4000);
                        answeredUsers[gameId][userId] = false;
                    }
                    await funcAnswersCount(userId);

                    if (Number(updatedUser.game[0].game_answers) === Number(checkQuestion.game_questions.length)) {
                        console.log('===');
                        await funcUserLeader();
                    }
                } catch (error) {
                    console.log('error', error);
                }
            });

            socket.on('skipQuestion', async (data) => {
                try {
                    const checkQuestion = await GamesModel.findById(gameId);
                    console.log('Событие получено для пользователя:', userId, 'в игре:', gameId);

                    const updatedUser = await UsersModel.findOneAndUpdate(
                        { _id: userId },
                        {
                            $inc: {
                                'game.0.game_answers': 1,
                            },
                        },
                        { new: true }
                    );

                    console.log('dataNumber', data.dataNumber, '| game_questions.length', checkQuestion.game_questions.length);

                    console.log('Обновлено. Кол-во ответов:', updatedUser.game[0].game_answers);
                    socket.emit('gameTimeIsUp');
                    socket.emit('stopTimer');

                    setTimeout(function () {
                        socket.emit('questionTimerStart', updatedUser.game[0].game_answers);

                        if (checkQuestion.game_questions.length !== data.dataNumber + 1) {
                            socket.emit('requestGetQuestions', checkQuestion.game_questions[data.dataNumber + 1]);
                        } else socket.emit('requestGetQuestions');
                    }, 4000);

                    await funcAnswersCount(userId);

                    if (Number(updatedUser.game[0].game_answers) === Number(checkQuestion.game_questions.length)) {
                        console.log('===');
                        await funcUserLeader();
                    }
                } catch (error) {
                    console.log('error', error);
                }
            });

            async function funcUserLeader() {
                const time = await getCurrentTimer(gameId);
                const user = await UsersModel.findById(userId);
                console.log('answers', user.game[0].game_answers);
                console.log('correct_answers', user.game[0].game_correct_answers);

                const checkGameLeaderId = await GamesModel.find({ _id: gameId });

                const leaderIds = checkGameLeaderId.map(leader => leader.game_leaders);

                if (!leaderIds.includes(user.id)) {
                    await GamesModel.findOneAndUpdate(
                        { _id: gameId },
                        {
                            $push: {
                                game_leaders: { id: user.id, name: user.name, correct_answers: user.game[0].game_correct_answers, time: time }
                            },
                        },
                        { new: true }
                    )
                    socket.emit('stopTimer');
                    await funcLeadersCount();
                }
            }

            if (updatedGame) {
                console.log(`Отправка обновления для игры ${gameId}, онлайн2: ${updatedGame.game_online.online}. Лимит онлайна: ${updatedGame.game_online.max_online}`);
                io.to(gameId).emit('updateUserCount', updatedGame.game_online);
            }

            if (game_questions.game_questions.length < 1){
                socket.leave(gameId);
                socket.emit('gameOff', gameId);
            }

            if (updatedGame.game_online.online > updatedGame.game_online.max_online){
                socket.leave(gameId);
                console.log('limit', gameId);
                socket.emit('redirect', gameId);
            }
            else {
                socket.join(gameId);
                console.log('not limit', gameId);
            }
        } catch (err) {
            console.error('Ошибка при обновлении данных игры:', err.message);
            io.to(gameId).emit('error', 'Ошибка при присоединении к игре');
        }
    });
});


const clients = {};
io.on('connection', async (socket) => {
    socket.on('registerUser', async (userId) => {
        try {
            socket.userId = userId;
            clients[userId] = socket.id;
            console.log(`Пользователь ${userId} зарегистрирован с socket ID: ${socket.id}`);
            if (userId) {
                setTimeout(async () => {
                    if (!clients[userId] || clients[userId] === socket.id) {
                        console.log(`${userId} Присоединился.`);
                        await UsersModel.findOneAndUpdate(
                            { _id: userId },
                            { $set: { onlineMod: 'Online' } },
                            { new: true }
                        );
                    } else {
                        console.log(`${userId} ещё не вышел.`);
                    }
                }, 3000);
            }
        } catch (error) {
            console.error(`Ошибка при регистрации пользователя ${userId}:`, error);
        }
    });

    socket.on('disconnect', async () => {
        try {
            const userId = socket.userId;
            if (userId) {
                setTimeout(async () => {
                    if (!clients[userId] || clients[userId] === socket.id) {
                        console.log(`${userId} отключился.`);
                        await UsersModel.findOneAndUpdate(
                            { _id: userId },
                            { $set: { onlineMod: 'Offline' } },
                            { new: true }
                        );
                        delete clients[userId];
                    } else {
                        console.log(`${userId} всё ещё в сети.`);
                    }
                }, 3000);
            }
        } catch (error) {
            console.error(`Ошибка при отключении пользователя ${socket.userId}:`, error);
        }
    })

    socket.on('addFriend', async (senderData) => {
        try {
            const friendName = senderData.friendName;
            const friendData = await UsersModel.findOne({ friendName });

            const friendSocketId = clients[friendData.id];
            const friendOnlineMod = await UsersModel.findById(friendData.id);
            const data = await UsersModel.findById(senderData.senderId);

            if (friendData.id.toString() === senderData.senderId.toString()) {
                socket.emit('broadcastFriendIdSenderId');
                return;
            }
            if (data.myFriends.some(friend => friend.id === friendData.id)) {
                socket.emit('broadcastAlreadyFriend');
                return;
            }
            if (friendSocketId && friendOnlineMod.onlineMod === 'Online') {
                socket.emit('broadcastFriendRequest');
                io.to(friendSocketId).emit('friendRequest', {
                        senderName: data.name,
                        senderId: data.id,
                        senderImage: data.image,
                        friendId: friendData.id,
                    });
                console.log(`Запрос в друзья отправлен пользователю ${friendData.id}`);
            } else {
                console.log(`Пользователь ${friendData.id} не в сети`);
                socket.emit('playerIsOffline');
            }
        } catch (error) {
            console.log('error', error);
            socket.emit('broadcastFriendNotFound');
        }
    });

    socket.on('acceptFriendRequest', async (acceptData) => {
        try {
            const friend = await UsersModel.findById(acceptData.acceptData.dataId);
            const sender = await UsersModel.findById(acceptData.acceptData.senderId);
            const friendSocketId = clients[acceptData.acceptData.dataId];
            const senderSocketId = clients[acceptData.acceptData.senderId];
            console.log('friendSocketId', friendSocketId)
            console.log('senderSocketId', senderSocketId)

            if (senderSocketId) {
                await UsersModel.findOneAndUpdate(
                    { _id: acceptData.acceptData.senderId },
                    {
                        $push: {
                            myFriends: { id: friend.id }
                        }
                    },
                    { new: true }
                );

                await UsersModel.findOneAndUpdate(
                    { _id: acceptData.acceptData.dataId },
                    {
                        $push: {
                            myFriends: { id: sender.id }
                        }
                    },
                    { new: true }
                );

                const updateMyFriendsCount = await UsersModel.findById(acceptData.acceptData.senderId);
                io.emit('updatePage');

                io.to(senderSocketId).emit('broadcastUpdateMyFriends', updateMyFriendsCount.myFriends);
                io.emit('reloadOtherPage');
                console.log('send to', senderSocketId + ' | ' + acceptData.acceptData.senderId);
            }
        } catch (error) {
            console.log('error', error);
        }
    })

    socket.on('delete-friend', async (deleteData) => {
        try {
            const myId = deleteData.deleteData.myId;
            const deleteId = deleteData.deleteData.deleteId;
            console.log('deleteId', deleteId)

            await UsersModel.findOneAndUpdate(
                { _id: myId },
                {
                    $pull: { myFriends: { id: { $in: deleteId } } }
                },
                { new: true }
            );

            await UsersModel.findOneAndUpdate(
                { _id: deleteId },
                {
                    $pull: { myFriends: { id: { $in: myId } } }
                },
                { new: true }
            );
            io.emit('updatePage');
            socket.emit('reloadOtherPage');
        } catch (error) {
            console.log('error', error);
        }
    })

    socket.on('requestMyFriendsCount', async (sendId) => {
        try {
            const updateMyFriendsCount = await UsersModel.findById(sendId);
            const getIds = updateMyFriendsCount.myFriends.map(doc => doc.id);
            const myFriendsData = await UsersModel.find({ '_id': { $in: getIds } });

            const friendsInfo = myFriendsData.map(friend => ({
                id: friend.id,
                name: friend.name,
                image: friend.image,
                onlineMod: friend.onlineMod
            }));

            socket.emit('updateMyFriendsCount', friendsInfo);
        } catch (error) {
            console.log('error', error);
        }
    });


    socket.on('inviteFriend', async (senderData) => {
        try {
            const friendSocketId = clients[senderData.senderData.friendId];
            const friendOnlineMod = await UsersModel.findById(senderData.senderData.friendId);
            console.log('friendSocketId', friendSocketId);

            const data = await UsersModel.findById(senderData.senderData.senderId);

            if (friendSocketId && friendOnlineMod.onlineMod === 'Online') {
                socket.emit('broadcastInviteRequest');
                io.to(friendSocketId).emit('inviteRequest', {
                    requestData: {
                        senderId: senderData.senderData.senderId,
                        senderName: data.name,
                        senderImage: data.image,
                        gameId: senderData.senderData.gameId,
                        friendId: senderData.senderData.friendId,
                    }
                });
                console.log(`Запрос отправлен пользователю ${senderData.senderData.friendId}`);
            } else {
                console.log(`Пользователь ${senderData.senderData.friendId} не в сети`);
                socket.emit('playerIsOffline');
            }
        } catch (error) {
            console.log('error', erorr)
        }
    });

    socket.on('requestAcceptInvite', async (data) => {
        try {
            const friendSocketId = clients[data.requestData.senderId];
            const friendOnlineMod = await UsersModel.findById(data.requestData.senderId);

            const getId = await UsersModel.findById(data.requestData.friendId);

            if (friendSocketId && friendOnlineMod.onlineMod === 'Online') {
                io.to(friendSocketId).emit('broadcastAcceptInvite', {
                    requestData: {
                        name: getId.name,
                    }
                });
                console.log(`Запрос отправлен пользователю ${data.requestData.friendId}`);
            } else {
                console.log(`Пользователь ${data.requestData.friendId} не в сети`);
                socket.emit('playerIsOffline');
            }
        } catch (error) {
            console.log('error', error);
        }
    });

    socket.on('requestRejectInvite', async (data) => {
        try {
            const friendSocketId = clients[data.requestData.senderId];

            const friendOnlineMod = await UsersModel.findById(data.requestData.senderId);

            const getId = await UsersModel.findById(data.requestData.friendId);

            if (friendOnlineMod.onlineMod === 'Online') {
                io.to(friendSocketId).emit('broadcastRejectInvite', {
                    requestData: {
                        name: getId.name,
                    }
                });
                console.log(`Запрос отправлен пользователю ${data.requestData.friendId}`);
            } else {
                console.log(`Пользователь ${data.requestData.friendId} не в сети`);
                socket.emit('playerIsOffline');
            }
        } catch (error) {
            console.log('error', error);
        }
    });

    socket.on('joinRoom', (channelId) => {
        console.log(socket.id, 'зашёл в чат', channelId);
        socket.join(channelId);
    });

    socket.on('leaveRoom', (channelId) => {
        console.log(socket.id, 'покинул чат', channelId);
        socket.leave(channelId);
    });

    socket.on('sendMessage', async (messageData) => {
        try {
            const companionSocketId = clients[messageData.companionId]
            const cleanMessage = sanitizeHtml(messageData.message, {
                allowedTags: ['b', 'i', 'em', 'strong', 'br'],
            });

            const replyData = await ChannelsModel.findById(messageData.channelId);
            const messages = replyData.messages;

            if (cleanMessage.length !== 0 || cleanMessage.length !== 0 && messageData.replyId) {
                let newMessage;
                const replyId = messages.find(r => r._id.toString() === messageData.replyId);
                let replyInfo;

                if (replyId !== undefined) {
                    replyInfo = await UsersModel.findById(replyId.id);
                    newMessage = {
                        _id: new mongoose.Types.ObjectId(),
                        id: messageData.id,
                        name: messageData.name,
                        message: cleanMessage,
                        reply: {
                            msgId: replyId._id,
                            toWho: replyId.id,
                            id: messageData.id,
                            name: replyId.name,
                            message: replyId.message
                        }
                    };
                } else {
                    newMessage = {
                        _id: new mongoose.Types.ObjectId(),
                        id: messageData.id,
                        name: messageData.name,
                        message: cleanMessage,
                    };
                }

                await ChannelsModel.findOneAndUpdate(
                    { _id: messageData.channelId },
                    { $push: { messages: newMessage } },
                    { new: true }
                );
                const userInfo = await UsersModel.findById(messageData.id);

                console.log('newMessage._id', newMessage._id);

                io.to(messageData.channelId).emit('showMessages', {
                    _id: newMessage._id,
                    id: messageData.id,
                    name: messageData.name,
                    message: cleanMessage,
                    image: userInfo.image,
                    reply: {
                        msgId: replyId ? replyId._id : null,
                        id: replyId ? messageData.id : null,
                        name: replyId ? replyId.name : null,
                        image: replyId ? replyInfo.image : null,
                        message: replyId ? replyId.message : null
                    },
                    date: new Date
                })
                io.to(companionSocketId).emit('sendMissedMessage', {
                    id: messageData.id,
                    name: messageData.name,
                    message: cleanMessage,
                    image: userInfo.image,
                    channelId: messageData.channelId
                });
            }
        } catch (error) {
            console.log('error', error);
        }
    });

    socket.on('deleteMsg', async (msgData) => {
        try {
            console.log('msgData', msgData);

            const findChannel = await ChannelsModel.findById(msgData.channelId);

            const findDeleteMsg = findChannel.messages.find(m => m._id.toString() === msgData.msgId.toString());

            console.log('findDelete_id', findDeleteMsg._id);
            console.log(findDeleteMsg.id.toString(), '|', socket.userId.toString());

            if (findDeleteMsg.id.toString() === socket.userId.toString()) {
                io.to(msgData.channelId).emit('deleteMessage', {
                    msgId: findDeleteMsg._id
                })
                await ChannelsModel.findOneAndUpdate(
                    { _id: msgData.channelId },
                    {
                        $pull: {
                            'messages': {_id: findDeleteMsg._id}
                        },
                    },
                    { new: true }
                )
                console.log('Сообщение удалено!');
                socket.emit('broadcastDeleteMsg');
            }
        } catch (error) {
            console.log('error', error);
        }
    });

    socket.on('editMsg', async (msgData) => {
        try {
            const findChannel = await ChannelsModel.findById(msgData.channelId);

            const findEditMsg = findChannel.messages.find(m => m._id.toString() === msgData.msgId.toString());

            const cleanMessage = sanitizeHtml(msgData.newMsg, {
                allowedTags: ['b', 'i', 'em', 'strong', 'br'],
            });

            if (findEditMsg.id.toString() === socket.userId.toString() && cleanMessage.length !== 0) {
                const userInfo = await UsersModel.findById(findEditMsg.id);
                console.log('userInfo', userInfo.name);
                console.log('msgData', msgData.newMsg);
                await ChannelsModel.findOneAndUpdate(
                    { _id: msgData.channelId },
                    {
                        $set: {
                            'messages.$[elem].message': cleanMessage,
                            'messages.$[elem].edited': true
                        }
                    },
                    {
                        arrayFilters: [{ 'elem._id': msgData.msgId }],
                        new: true
                    }
                );
                io.to(msgData.channelId).emit('editedMsg', {
                    userName: userInfo.name,
                    userImage: userInfo.image,
                    msgId: msgData.msgId,
                    editMessage: cleanMessage,
                })
            }
        } catch (error) {
            console.log('error', error);
        }
    });

    socket.on('checkOnline', async (userData) => {
        try {
            const channel = await ChannelsModel.findById(userData.channelId);

            if (channel.channelUsers[0].id !== userData.sendId) {
                const user = await UsersModel.findById(channel.channelUsers[0].id);
                const userOnline = user.onlineMod;
                socket.emit('onlineMod', {
                    userOnline
                });
            }
            else {
                const user = await UsersModel.findById(channel.channelUsers[1].id);
                const userOnline = user.onlineMod;
                socket.emit('onlineMod', {
                    userOnline
                });
            }
        } catch (error) {
            console.log('error', error);
        }
    });

    socket.on('requestUpdateRole', async (email) => {
        const userId = socket.userId;

        console.log('email', email);

        console.log('userId', userId);

        try {
            const sender = await UsersModel.findById(userId);

            if (sender.role === 'Admin') {
                const emailId = await UsersModel.findOne({email});
                const updateSocketId = clients[emailId.id];
                console.log('updateId', updateSocketId);

                io.to(updateSocketId).emit('updateRole');
            }
        } catch (error) {
            console.log('error', error);
        }
    });

    socket.on('requestLikeNews', async (newsId) => {
        try {
            const userId = socket.userId;
            console.log('userId', userId, 'newsId', newsId);

            const news = await NewsModel.findById(newsId);
            if (!news) {
                console.log('id не найден.');
                return;
            }

            const checkUserReacts = news.reactions.likes.find(id => id.toString() === userId.toString());

            if (checkUserReacts) {
                await NewsModel.findOneAndUpdate(
                    { _id: news._id },
                    {
                        $pull: {
                            'reactions.likes': userId,
                            'reactions.dislikes': userId
                        }
                    }, { new: true }
                );
                socket.emit('reactionsCount', {
                    type: 'reset',
                    newsId
                });
                return;
            }

            await NewsModel.findOneAndUpdate(
                { _id: news._id },
                {
                    $addToSet: {
                        'reactions.likes': userId
                    },
                    $pull: {
                        'reactions.dislikes': userId
                    }
                }, { new: true }
            );
            socket.emit('reactionsCount', {
                type: 'like',
                newsId
            });
        } catch (error) {
            console.log('error', error);
        }
    });

    socket.on('requestDislikeNews', async (newsId) => {
        try {
            const userId = socket.userId;
            console.log('userId', userId, 'newsId', newsId);

            const news = await NewsModel.findById(newsId);
            if (!news) {
                console.log('id не найден.');
                return;
            }

            const checkUserReacts = news.reactions.dislikes.find(id => id.toString() === userId.toString());

            if (checkUserReacts) {
                await NewsModel.findOneAndUpdate(
                    { _id: news._id },
                    {
                        $pull: {
                            'reactions.dislikes': userId,
                            'reactions.likes': userId
                        }
                    }, { new: true }
                );
                socket.emit('reactionsCount', {
                    type: 'reset',
                    newsId
                });
                return;
            }

            await NewsModel.findOneAndUpdate(
                { _id: news._id },
                {
                    $addToSet: {
                        'reactions.dislikes': userId
                    },
                    $pull: {
                        'reactions.likes': userId
                    }
                }, { new: true }
            );
            socket.emit('reactionsCount', {
                type: 'dislike',
                newsId
            });
        } catch (error) {
            console.log('error', error);
        }
    });

});


start();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true,
    createParentPath: true,
    safeFileNames: true,
    preserveExtension: true
}));

app.use('/uploads', (req, res, next) => {
    next();
}, express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);

app.use((req, res, next) => {
    next(createError(404));
});

app.use(errorHandler);

app.use(function(err, req, res, next) {
    try {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        res.status(err.status || 500);
        const message = req.query.message || err.message;
        const code = req.query.code || '404';

        let locale = req.cookies['locale'] || 'en';

        if (!req.cookies['locale']) {
            res.cookie('locale', locale, { httpOnly: true });
        }

        res.render(locale === 'en' ? 'en/error' : 'ru/error', { code, message });
    } catch (error) {
        console.log('app Error', error);
    }
});

server.listen(3000, async () => {
    const findAllGames = await GamesModel.find({});
    const getAllGameId = findAllGames.map(get => get.id);
    await GamesModel.updateMany(
        { _id: { $in: getAllGameId } },
        {
            $set: {
                'game_online.online': 0,
                'game_online.users': [],
                'game_users': [],
                'game_leaders': [],
                'game_type': 'Open',
                expiresInMinutes: 60,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                // createdAt: Date.now(),
            }
        },
    );
    const findAllUsers = await UsersModel.find({});
    const getAllUserId = findAllUsers.map(get => get.id);
    await UsersModel.updateMany(
        { _id: { $in: getAllUserId } },
        {
            $set: {
                'onlineMod': 'Offline',
            }
        },
    );
    io.emit('reloadPage');
    console.log('Сервер запущен на порту localhost: http://localhost:3000');

    async function getNgrokUrl() {
        try {
            const res = await axios.get('http://127.0.0.1:4040/api/tunnels');
            const tunnels = res.data.tunnels;
            tunnels.forEach(tunnel => {
                console.log("Сервер запущен на порту ngrok:", tunnel.public_url);
            });
        } catch (err) {
            console.error("Ошибка ngrok API:", err.message);
        }
    }

    getNgrokUrl();
});