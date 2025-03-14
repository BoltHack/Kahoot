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
        // const expiresInMinutes = game_max_online.expiresInMinutes;

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
                            createdAt: Date.now()
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

            socket.on('ban', async (userId) => {
                const {gameId} = socket;
                const getUserData = await UsersModel.findById(userId);
                const game = await GamesModel.findById(gameId);

                const isAlreadyBanned = game.game_banned_users.some(user => {
                    const bannedId = user.bannedId.toString();
                    const checkingUserId = userId.toString();
                    return bannedId === checkingUserId;
                });

                if (!isAlreadyBanned){
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

                let updateBannedUsers = await GamesModel.updateOne(
                    { _id: gameId },
                    { $pull: { game_banned_users: { bannedId: { $in: userId } } } }
                );

                console.log('unban', userId);
                io.to(gameId).emit('updateBannedUsers', updateBannedUsers.game_banned_users);
                socket.emit('unbanBroadcast', userId);
            });


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

                if (game.game_online?.online === 0){
                    await GamesModel.findOneAndUpdate(
                        { _id: gameId },
                        {
                            $set: {
                                expiresInMinutes: 60,
                                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                                createdAt: Date.now()
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

// io.on('connection', (socket) => {
//     socket.on('kick', async (userId) => {
//         const {gameId} = socket;
//         let updateBannedUsers = await GamesModel.findByIdAndUpdate(
//             { _id: gameId },
//             {
//                 $push: { 'game_banned_users': {bannedId: userId} },
//             },
//             {new: true}
//         );
//         console.log('kick', userId, 'from', gameId);
//         io.to(gameId).emit('updateBannedUsers', updateBannedUsers.game_banned_users);
//     });
// });



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
                'game_leaders': []
            }
        },
    );
    io.emit('reloadPage');
    console.log('Сервер запущен на порту: http://localhost:3000');
});
