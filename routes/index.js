const express = require('express');
const AuthRouter = require('./AuthRouter');
const AdminRouter = require('./AdminRouter');

const {
    mainView, createGameView, gameView, redactionView, myGamesView, friendsView, settingsView, returnMenuView, privacyPolicyView,
    rulesView, aboutUsView, supportView, newsView, readNewsView
} = require('../controllers/ViewController');
const {
    createGame, redaction, deleteGame, deleteAllGames, gameUsers, gameCorrectUsers, userLeader, getData, getUserData, changeAvatar, deleteImage,
    changeLocal, changeLocalAuth, changeSettings, sendContacts, viewNews, checkToken
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
router.get('/friends', authenticateJWT, friendsView);
router.get('/settings', authenticateJWT, settingsView);
router.get('/return-menu', returnMenuView);
router.get('/privacyPolicy', privacyPolicyView);
router.get('/rules', rulesView);
router.get('/aboutUs', aboutUsView);
router.get('/support', supportView);
router.get('/news', newsView);
router.get('/read-news/:news_id', readNewsView);


router.post('/create-game', authenticateJWT, createGame);
router.post('/delete-game/:game_id', authenticateJWT, deleteGame);
router.post('/redaction/:game_id', authenticateJWT, redaction);

router.post('/user-leader/:game_id/:game_time', authenticateJWT, userLeader);
router.post('/deleteAllGames', authenticateJWT, deleteAllGames);

router.post('/getData/:game_id', authenticateJWT, getData);
router.post('/getUserData', authenticateJWT, getUserData);

router.post('/changeAvatar/:user_id', authenticateJWT, changeAvatar);
router.post('/deleteAvatar/:user_id', authenticateJWT, deleteImage);

router.post('/changeLocal/:locale', changeLocal);
router.post('/changeLocalAuth/:id/:locale', changeLocalAuth);

router.post('/changeSettings/:user_id', changeSettings);

router.post('/sendContacts', sendContacts);

router.post('/viewNews/:news_id', viewNews);

router.post('/accessToken', accessToken);
router.post('/refreshToken', refreshToken);
router.post('/checkToken', checkToken);

router.use('/auth', AuthRouter);
router.use('/admin', AdminRouter);

module.exports = router;
