const express = require('express');
const AuthRouter = require('./AuthRouter');

const {
    mainView, createGameView, gameView, redactionView, myGamesView, shopView, settingsView, returnMenuView
} = require('../controllers/ViewController');
const {
    createGame, redaction, deleteGame, deleteAllGames, gameUsers, gameCorrectUsers, userLeader, getData, changeAvatar, deleteImage,
    changeLocal, changeLocalAuth, changeSettings
} = require('../controllers/PostController');
const {authenticateJWT} = require('../middlewares/jwtAuth');
const {accessToken} = require('../middlewares/updateAccessToken');
const {refreshToken} = require('../middlewares/updateRefreshToken');
const router = express.Router();

router.get('/', mainView);
router.get('/create-game', authenticateJWT, createGameView);
router.get('/game/:game_id', authenticateJWT, gameView);
router.get('/redaction/:game_id', authenticateJWT, redactionView);
router.get('/my-games', authenticateJWT, myGamesView);
router.get('/shop', shopView);
router.get('/settings', authenticateJWT, settingsView);
router.get('/return-menu', returnMenuView);

router.post('/create-game', authenticateJWT, createGame);
router.post('/delete-game/:game_id', authenticateJWT, deleteGame);
router.post('/redaction/:game_id', authenticateJWT, redaction);

router.post('/game-users/:user_id', authenticateJWT, gameUsers);
router.post('/game-correct-users/:user_id', authenticateJWT, gameCorrectUsers);

router.post('/user-leader/:game_id/:game_time', authenticateJWT, userLeader);
router.post('/deleteAllGames', authenticateJWT, deleteAllGames);
router.post('/getData/:game_id', authenticateJWT, getData);

router.post('/changeAvatar/:user_id', authenticateJWT, changeAvatar);
router.post('/deleteAvatar/:user_id', authenticateJWT, deleteImage);

router.post('/changeLocal/:locale', changeLocal);
router.post('/changeLocalAuth/:id/:locale', changeLocalAuth);

router.post('/changeSettings/:user_id', changeSettings);

router.post('/accessToken', accessToken);
router.post('/refreshToken', refreshToken);

router.use('/auth', AuthRouter);

module.exports = router;
