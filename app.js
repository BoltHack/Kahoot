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
const { GamesModel } = require('./models/GamesModel');
const { UsersModel } = require('./models/UsersModel');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let gameUsers = {};
io.on('connection', async (socket) => {
    console.log('Новый пользователь подключился');

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
            const userInfo = await UsersModel.findById(userId);
            const userImage = userInfo.image;
            const game = await GamesModel.findOneAndUpdate(
                { _id: gameId },
                {
                    $inc: { 'game_online.online': -1 },
                    $pull: { 'game_online.users': { userId, userName, userImage }, 'game_users': {userId} },
                    // $set: {
                    //     'game_users': [],
                    //     'game_leaders': []
                    // }
                },
                { new: true }
            );

            if (game.game_online?.online <= 1){
                await GamesModel.findOneAndUpdate(
                    { _id: gameId },
                    {
                        $set: {
                            'game_leaders': [],
                            'game_type': 'Open'
                        }
                    },
                    { new: true }
                );
            }
            if (game.game_online?.online === 0){
                await GamesModel.findOneAndUpdate(
                    { _id: gameId },
                    {
                        $set: {
                            expiresInMinutes: 60,
                            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                            createdAt: Date.now(),
                            'game_type': 'Open'
                        }
                    },
                    { new: true }
                );
            }

            socket.emit('updateUserCount', game.game_online);

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
        const updateGameAccessCount = await GamesModel.findById(gameId);

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
            await GamesModel.updateMany({}, { $unset: { expiresInMinutes: 1, createdAt: 1, expiresAt: 1 } });

            socket.emit('updateUserCount', updatedGame.game_online);
            socket.emit('updateUsersOnline', updatedGame.game_online.online);

            socket.emit('updateAnswersCount', updateAnswers.game);
            socket.emit('updateGameQuestions', game_questions);
            socket.emit('updateBannedUsers', checkUserBanned.game_banned_users);
            socket.emit('updateGameTypeCount', updateGameTypeCount.game_type);

            socket.on('requestAnswersCount', async () => {
                const updateAnswers = await UsersModel.findById(userId);
                socket.emit('updateAnswersCount', updateAnswers.game);
            });

            socket.on('requestLeadersCount', async () => {
                const updateLeaderBoard = await GamesModel.findById(gameId);
                socket.emit('updateLeaderBoard', updateLeaderBoard.game_leaders);
            });

            socket.on('requestBannedUsersCount', async () => {
                const updateBannedUsersCount = await GamesModel.findById(gameId);
                socket.emit('updateBannedUsersCount', updateBannedUsersCount.game_banned_users);
            });

            socket.on('requestGameTypeCount', async () => {
                socket.emit('updateGameTypeCount', updateGameTypeCount.game_type);
            });

            socket.on('requestGameAccessCount', async () => {
                const updateGameAccessCount = await GamesModel.findById(gameId);
                const updateUserFriendsCount = await UsersModel.findById(userId);
                socket.emit('updateGameAccessCount', {
                    gameData:
                     { userFriends: updateUserFriendsCount.myFriends, gameAccess: updateGameAccessCount.game_access }
                });
            });

            // socket.on('requestUserFriendsCount', async () => {
            //     const updateUser = await UsersModel.findById(userAuthorId);
            //     socket.emit('updateUserFriendsCount', updateUser.myFriends);
            // });

            let alreadyBannedUserIds = [];

            socket.on('ban', async (userId) => {
                const {gameId} = socket;
                const getUserData = await UsersModel.findById(userId);

                if (!alreadyBannedUserIds.includes(userId)){
                    alreadyBannedUserIds.push(userId);
                    let updateBannedUsers = await GamesModel.findOneAndUpdate(
                        { _id: gameId },
                        {
                            $push: {
                                "game_banned_users": {bannedId: userId, bannedName: getUserData.name, bannedImage: getUserData.image}
                            }
                        },
                        {new: true}
                    );
                    console.log('ban', userId, 'from', gameId);
                    io.to(gameId).emit('updateBannedUsers', updateBannedUsers.game_banned_users);
                }


                socket.emit('banBroadcast', userName);
            });

            socket.on('unban', async (userId) => {
                const { gameId } = socket;
                alreadyBannedUserIds.splice(userId);
                let updateBannedUsers = await GamesModel.updateOne(
                    { _id: gameId },
                    { $pull: { game_banned_users: { bannedId: { $in: userId } } } }
                );

                console.log('unban', userId);
                io.to(gameId).emit('updateBannedUsers', updateBannedUsers.game_banned_users);
                socket.emit('unbanBroadcast', userId);
            });

            socket.on('closeGame', async () => {
                await GamesModel.updateOne(
                    { _id: gameId },
                    { $set: { game_type: 'Close' } }
                );
                console.log('the game is closed.');
                socket.emit('updateGameTypeCount', updateGameTypeCount.game_type);
            })
            socket.on('openGame', async () => {
                await GamesModel.updateOne(
                    { _id: gameId },
                    { $set: { game_type: 'Open' } }
                );

                console.log('the game is open.');
                socket.emit('updateGameTypeCount', updateGameTypeCount.game_type);
            })

            if (updatedGame) {
                console.log(`Отправка обновления для игры ${gameId}, онлайн2: ${updatedGame.game_online.online}. Лимит онлайна: ${game_max_online.game_online.max_online}`);
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

    socket.on('leaveGame', async (gameId, userId, userName) => {
        console.log(`Пользователь ${userId} покидает игру ${gameId}`);
        console.log(`Получено событие leaveGame: gameId = ${gameId}, userId = ${userId}`);

        if (!gameId || !userId) {
            console.error('Ошибка: не переданы gameId или userId');
            return;
        }

        if (gameUsers[gameId]) {
            gameUsers[gameId] = gameUsers[gameId].filter(id => id !== userId);
        }

        console.log(`Пользователь ${userId}(${userName}) покинул игру ${gameId}.`);

        try {
            const userInfo = await UsersModel.findById(userId);
            const userImage = userInfo.image;
            const game = await GamesModel.findOne({ _id: gameId });

            if (game) {
                const newOnlineCount = Math.max(0, game.game_online.online - 1);

                const updatedGame = await GamesModel.findOneAndUpdate(
                    { _id: gameId },
                    {
                        $set: { 'game_online.online': newOnlineCount },
                        $pull: { 'game_online.users': { userId, userName, userImage }, 'game_users': {userId} }
                    },
                    { new: true }
                );

                if (game.game_online?.online <= 1){
                    await GamesModel.findOneAndUpdate(
                        { _id: gameId },
                        {
                            $set: {
                                'game_leaders': [],
                                'game_type': 'Open'
                            }
                        },
                        { new: true }
                    );
                }
                if (game.game_online?.online === 0){
                    await GamesModel.findOneAndUpdate(
                        { _id: gameId },
                        {
                            $set: {
                                expiresInMinutes: 60,
                                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                                createdAt: Date.now(),
                                'game_type': 'Open'
                            }
                        },
                        { new: true }
                    );
                }

                socket.emit('updateUserCount', updatedGame.game_online);

                if (updatedGame) {
                    console.log(`Отправка обновления для игры ${gameId}, онлайн3: ${updatedGame.game_online.online}`);
                    io.to(gameId).emit('updateUserCount', updatedGame.game_online);
                } else {
                    console.error('Игра не найдена!');
                }
            } else {
                console.error('Игра не найдена!');
            }
        } catch (err) {
            console.error('Ошибка при обновлении данных игры:', err);
        }

        socket.leave(gameId);
    });
});


const clients = {};
io.on('connection', async (socket) => {
    socket.on('registerUser', async (userId) => {
        console.log('userId', userId);
        clients[userId] = socket.id;
        console.log(`Пользователь ${userId} зарегистрирован с socket ID: ${socket.id}`);
    });

    socket.on('addFriend', async (senderData) => {
        const friendSocketId = clients[senderData.senderData.friendId];

        const data = await UsersModel.findById(senderData.senderData.senderId);

        if (friendSocketId) {
            socket.emit('broadcastFriendRequest');
            io.to(friendSocketId).emit('friendRequest', {
                requestData: {
                    senderName: data.name,
                    senderId: data.id,
                    senderImage: data.image,
                    friendId: senderData.senderData.friendId,
            }});
            console.log(`Запрос в друзья отправлен пользователю ${senderData.senderData.friendId}`);
        } else {
            console.log(`Пользователь ${senderData.senderData.friendId} не в сети`);
            socket.emit('playerIsOffline');
        }
    });

    socket.on('acceptFriendRequest', async (acceptData) => {
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
                        myFriends: { id: friend.id, name: friend.name, image: friend.image }
                    }
                },
                { new: true }
            );

            await UsersModel.findOneAndUpdate(
                { _id: acceptData.acceptData.dataId },
                {
                    $push: {
                        myFriends: { id: sender.id, name: sender.name, image: sender.image }
                    }
                },
                { new: true }
            );

            const updateMyFriendsCount = await UsersModel.findById(acceptData.acceptData.senderId);
            io.emit('updatePage');

            // io.to(friendSocketId).emit('updateMyFriendsCount', friend.myFriends);
            // io.to(senderSocketId).emit('updateMyFriendsCount', updateMyFriendsCount.myFriends);

            io.to(senderSocketId).emit('broadcastUpdateMyFriends', updateMyFriendsCount.myFriends);

            console.log('send to', senderSocketId + ' | ' + acceptData.acceptData.senderId);
        }
    })

    socket.on('delete-friend', async (deleteData) => {
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
        // const updateMyFriendsCount = await UsersModel.findById(myId);
        // io.emit('updateMyFriendsCount', updateMyFriendsCount.myFriends);
        io.emit('updatePage');
    })

    socket.on('requestMyFriendsCount', async (sendId) => {
        const updateMyFriendsCount = await UsersModel.findById(sendId);
        socket.emit('updateMyFriendsCount', updateMyFriendsCount.myFriends);
    });


    socket.on('inviteFriend', async (senderData) => {
        const friendSocketId = clients[senderData.senderData.friendId];

        const data = await UsersModel.findById(senderData.senderData.senderId);

        if (friendSocketId) {
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
    });

    socket.on('requestAcceptInvite', async (data) => {
        const friendSocketId = clients[data.requestData.senderId];

        const getId = await UsersModel.findById(data.requestData.friendId);

        if (friendSocketId) {
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
    });

    socket.on('requestRejectInvite', async (data) => {
        const friendSocketId = clients[data.requestData.senderId];

        const getId = await UsersModel.findById(data.requestData.friendId);

        if (friendSocketId) {
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
    });

});


start();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.use('/', indexRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  const message = req.query.message || err.message;

  let locale = req.cookies['locale'] || 'en';

  if (!req.cookies['locale']) {
    res.cookie('locale', locale, { httpOnly: true });
  }

  res.render(locale === 'en' ? 'en/error' : 'ru/error', { message });
});

server.listen(3000, async () => {
    const findAllGames = await GamesModel.find({});
    const getAllId = findAllGames.map(get => get.id);
    await GamesModel.updateMany(
        { _id: { $in: getAllId } },
        {
            $set: {
                'game_online.online': 0,
                'game_online.users': [],
                'game_users': [],
                'game_leaders': [],
                'game_type': 'Open'
            }
        },
    );
    io.emit('reloadPage');
    console.log('Сервер запущен на порту: http://localhost:3000');
});