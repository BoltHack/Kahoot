const express = require('express');
const AuthRouter = require('./AuthRouter');
const AdminRouter = require('./AdminRouter');

const {
    mainView, createGameView, gameView, redactionView, myGamesView, settingsView, returnMenuView,
    privacyPolicyView, rulesView, aboutUsView, supportView, newsView, readNewsView, aboutDonatesView,
    userProfileView, channelsView, channelsMeView, createQuestionView, editQuestionView, contactsView,
    reviewsView
} = require('../controllers/ViewController');
const {
    createGame, redaction, deleteGame, deleteAllGames, getData, getUserData, changeAvatar,
    changeLocale, changeSettings, sendContacts, viewNews, checkToken, changeBackgroundImage,
    languageConfirmation, changeStatus, changeAboutMe, checkChannel, deleteMyChannel,
    createQuestion, editQuestion, deleteQuestion, requestTechSupport, sendReview, deleteMyReview
} = require('../controllers/PostController');
const {authenticateJWT} = require('../middlewares/jwtAuth');
const {accessToken} = require('../middlewares/updateAccessToken');
const {refreshToken} = require('../middlewares/updateRefreshToken');
const {checkAccountPermissions} = require('../middlewares/checkAccountPermissions');
const {appData} = require("../middlewares/appData");

const router = express.Router();

router.get('/', checkAccountPermissions, appData, mainView);
router.get('/create-game', authenticateJWT, checkAccountPermissions, appData, createGameView);
router.get('/game/:game_id', authenticateJWT, checkAccountPermissions, appData, gameView);
router.get('/redaction/:game_id', authenticateJWT, checkAccountPermissions, appData, redactionView);
router.get('/edit-question/:game_id/:question_id', authenticateJWT, checkAccountPermissions, appData, editQuestionView);
router.get('/create-questions/:game_id', authenticateJWT, checkAccountPermissions, appData, createQuestionView);
router.get('/my-games', authenticateJWT, checkAccountPermissions, appData, myGamesView);

router.get('/settings', authenticateJWT, checkAccountPermissions, appData, settingsView);

router.get('/return-menu', returnMenuView);

router.get('/privacyPolicy', checkAccountPermissions, appData, privacyPolicyView);
router.get('/rules', checkAccountPermissions, appData, rulesView);
router.get('/aboutUs', checkAccountPermissions, appData, aboutUsView);
router.get('/contacts', checkAccountPermissions, appData, contactsView);
router.get('/reviews', checkAccountPermissions, appData, reviewsView);
router.get('/about-donates', checkAccountPermissions, appData, aboutDonatesView);

router.get('/support', checkAccountPermissions, appData, supportView);
router.get('/news', checkAccountPermissions, appData, newsView);
router.get('/read-news/:news_id', checkAccountPermissions, appData, readNewsView);
router.get('/user-profile/:user_id', checkAccountPermissions, appData, userProfileView);

router.get('/channels/@me', authenticateJWT, checkAccountPermissions, appData, channelsMeView);
router.get('/channels/@me/:channel_id', authenticateJWT, checkAccountPermissions, appData, channelsView);


router.post('/create-game', authenticateJWT, appData, createGame);
router.post('/delete-game/:game_id', authenticateJWT, appData, deleteGame);
router.post('/redaction/:game_id', authenticateJWT, appData, redaction);
router.post('/edit-question/:game_id/:question_id', authenticateJWT, appData, editQuestion);
router.post('/delete-question/:game_id/:question_id', authenticateJWT, appData, deleteQuestion);
router.post('/create-questions/:game_id', authenticateJWT, appData, createQuestion);

router.post('/deleteAllGames', authenticateJWT, appData, deleteAllGames);

router.post('/getData/:game_id', authenticateJWT, appData, getData);
router.post('/getUserData', authenticateJWT, appData, getUserData);
router.post('/languageConfirmation', appData, languageConfirmation);

router.post('/changeAvatar/:action_type', authenticateJWT, appData, changeAvatar);
router.post('/changeBackgroundImage/:action_type', authenticateJWT, appData, changeBackgroundImage);
router.post('/changeLocale/:locale/:autoUpdate', appData, changeLocale);
router.post('/changeSettings/:authType', appData, changeSettings);
router.post('/changeStatus', authenticateJWT, appData, changeStatus);
router.post('/changeAboutMe', authenticateJWT, appData, changeAboutMe);

router.post('/review-send', authenticateJWT, appData, sendReview);
router.post('/review-delete', authenticateJWT, appData, deleteMyReview);

router.post('/sendContacts', appData, sendContacts);

router.post('/viewNews/:news_id', appData, viewNews);

router.post('/checkChannel/:user_id', authenticateJWT, appData, checkChannel);
router.post('/deleteMyChannel/:channel_id', authenticateJWT, appData, deleteMyChannel);
router.post('/requestTechSupport', authenticateJWT, appData, requestTechSupport);

router.post('/accessToken', accessToken);
router.post('/refreshToken', refreshToken);
router.post('/checkToken', checkToken);

router.use('/auth', AuthRouter);
router.use('/admin', AdminRouter);

module.exports = router;
