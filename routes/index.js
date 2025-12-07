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
    createGame, redaction, deleteGame, deleteAllGames, getData, getUserData, changeAvatar, deleteAvatar,
    changeLocale, changeSettings, sendContacts, viewNews, checkToken, changeBackgroundImage,
    languageConfirmation, deleteBackgroundImage, changeStatus, changeAboutMe, checkChannel, deleteMyChannel,
    createQuestion, editQuestion, deleteQuestion, requestTechSupport, sendReview, deleteMyReview
} = require('../controllers/PostController');
const {authenticateJWT} = require('../middlewares/jwtAuth');
const {accessToken} = require('../middlewares/updateAccessToken');
const {refreshToken} = require('../middlewares/updateRefreshToken');
const {checkAccountPermissions} = require('../middlewares/checkAccountPermissions');
const {defaultResponses} = require("../middlewares/defaultResponses");

const router = express.Router();

router.get('/', checkAccountPermissions, defaultResponses, mainView);
router.get('/create-game', authenticateJWT, checkAccountPermissions, defaultResponses, createGameView);
router.get('/game/:game_id', authenticateJWT, checkAccountPermissions, defaultResponses, gameView);
router.get('/redaction/:game_id', authenticateJWT, checkAccountPermissions, defaultResponses, redactionView);
router.get('/edit-question/:game_id/:question_id', authenticateJWT, checkAccountPermissions, defaultResponses, editQuestionView);
router.get('/create-questions/:game_id', authenticateJWT, checkAccountPermissions, defaultResponses, createQuestionView);
router.get('/my-games', authenticateJWT, checkAccountPermissions, defaultResponses, myGamesView);

router.get('/settings', authenticateJWT, checkAccountPermissions, defaultResponses, settingsView);

router.get('/return-menu', returnMenuView);

router.get('/privacyPolicy', checkAccountPermissions, defaultResponses, privacyPolicyView);
router.get('/rules', checkAccountPermissions, defaultResponses, rulesView);
router.get('/aboutUs', checkAccountPermissions, defaultResponses, aboutUsView);
router.get('/contacts', checkAccountPermissions, defaultResponses, contactsView);
router.get('/reviews', checkAccountPermissions, defaultResponses, reviewsView);
router.get('/about-donates', checkAccountPermissions, defaultResponses, aboutDonatesView);

router.get('/support', checkAccountPermissions, defaultResponses, supportView);
router.get('/news', checkAccountPermissions, defaultResponses, newsView);
router.get('/read-news/:news_id', checkAccountPermissions, defaultResponses, readNewsView);
router.get('/user-profile/:user_id', checkAccountPermissions, defaultResponses, userProfileView);

router.get('/channels/@me', authenticateJWT, checkAccountPermissions, defaultResponses, channelsMeView);
router.get('/channels/@me/:channel_id', authenticateJWT, checkAccountPermissions, defaultResponses, channelsView);


router.post('/create-game', authenticateJWT, defaultResponses, createGame);
router.post('/delete-game/:game_id', authenticateJWT, defaultResponses, deleteGame);
router.post('/redaction/:game_id', authenticateJWT, defaultResponses, redaction);
router.post('/edit-question/:game_id/:question_id', authenticateJWT, defaultResponses, editQuestion);
router.post('/delete-question/:game_id/:question_id', authenticateJWT, defaultResponses, deleteQuestion);
router.post('/create-questions/:game_id', authenticateJWT, defaultResponses, createQuestion);

router.post('/deleteAllGames', authenticateJWT, defaultResponses, deleteAllGames);

router.post('/getData/:game_id', authenticateJWT, defaultResponses, getData);
router.post('/getUserData', authenticateJWT, defaultResponses, getUserData);
router.post('/languageConfirmation', defaultResponses, languageConfirmation);

router.post('/changeAvatar/:action_type', authenticateJWT, defaultResponses, changeAvatar);
router.post('/changeBackgroundImage/:action_type', authenticateJWT, defaultResponses, changeBackgroundImage);
router.post('/changeLocale/:locale/:autoUpdate', defaultResponses, changeLocale);
router.post('/changeSettings/:authType', defaultResponses, changeSettings);
router.post('/changeStatus', authenticateJWT, defaultResponses, changeStatus);
router.post('/changeAboutMe', authenticateJWT, defaultResponses, changeAboutMe);

router.post('/review-send', authenticateJWT, defaultResponses, sendReview);
router.post('/review-delete', authenticateJWT, defaultResponses, deleteMyReview);

router.post('/sendContacts', defaultResponses, sendContacts);

router.post('/viewNews/:news_id', defaultResponses, viewNews);

router.post('/checkChannel/:user_id', authenticateJWT, defaultResponses, checkChannel);
router.post('/deleteMyChannel/:channel_id', authenticateJWT, defaultResponses, deleteMyChannel);
router.post('/requestTechSupport', authenticateJWT, defaultResponses, requestTechSupport);

router.post('/accessToken', accessToken);
router.post('/refreshToken', refreshToken);
router.post('/checkToken', checkToken);

router.use('/auth', AuthRouter);
router.use('/admin', AdminRouter);

module.exports = router;
