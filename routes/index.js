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
const router = express.Router();

router.get('/', checkAccountPermissions, mainView);
router.get('/create-game', authenticateJWT, checkAccountPermissions, createGameView);
router.get('/game/:game_id', authenticateJWT, checkAccountPermissions, gameView);
router.get('/redaction/:game_id', authenticateJWT, checkAccountPermissions, redactionView);
router.get('/edit-question/:game_id/:question_id', authenticateJWT, checkAccountPermissions, editQuestionView);
router.get('/create-questions/:game_id', authenticateJWT, checkAccountPermissions, createQuestionView);
router.get('/my-games', authenticateJWT, checkAccountPermissions, myGamesView);

router.get('/settings', authenticateJWT, checkAccountPermissions, settingsView);

router.get('/return-menu', returnMenuView);

router.get('/privacyPolicy', checkAccountPermissions, privacyPolicyView);
router.get('/rules', checkAccountPermissions, rulesView);
router.get('/aboutUs', checkAccountPermissions, aboutUsView);
router.get('/contacts', checkAccountPermissions, contactsView);
router.get('/reviews', checkAccountPermissions, reviewsView);
router.get('/about-donates', checkAccountPermissions, aboutDonatesView);

router.get('/support', checkAccountPermissions, supportView);
router.get('/news', checkAccountPermissions, newsView);
router.get('/read-news/:news_id', checkAccountPermissions, readNewsView);
router.get('/user-profile/:user_id', checkAccountPermissions, userProfileView);

router.get('/channels/@me', authenticateJWT, checkAccountPermissions, channelsMeView);
router.get('/channels/@me/:channel_id', authenticateJWT, checkAccountPermissions, channelsView);


router.post('/create-game', authenticateJWT, createGame);
router.post('/delete-game/:game_id', authenticateJWT, deleteGame);
router.post('/redaction/:game_id', authenticateJWT, redaction);
router.post('/edit-question/:game_id/:question_id', authenticateJWT, editQuestion);
router.post('/delete-question/:game_id/:question_id', authenticateJWT, deleteQuestion);
router.post('/create-questions/:game_id', authenticateJWT, createQuestion);

router.post('/deleteAllGames', authenticateJWT, deleteAllGames);

router.post('/getData/:game_id', authenticateJWT, getData);
router.post('/getUserData', authenticateJWT, getUserData);
router.post('/languageConfirmation', languageConfirmation);

router.post('/changeAvatar', authenticateJWT, changeAvatar);
router.post('/deleteAvatar', authenticateJWT, deleteAvatar);
router.post('/changeBackgroundImage', authenticateJWT, changeBackgroundImage);
router.post('/deleteBackgroundImage', authenticateJWT, deleteBackgroundImage);
router.post('/changeLocale/:locale/:autoUpdate', changeLocale);
router.post('/changeSettings/:authType', changeSettings);
router.post('/changeStatus', authenticateJWT, changeStatus);
router.post('/changeAboutMe', authenticateJWT, changeAboutMe);

router.post('/review-send', authenticateJWT, sendReview);
router.post('/review-delete', authenticateJWT, deleteMyReview);

router.post('/sendContacts', sendContacts);

router.post('/viewNews/:news_id', viewNews);

router.post('/checkChannel/:user_id', authenticateJWT, checkChannel);
router.post('/deleteMyChannel/:channel_id', authenticateJWT, deleteMyChannel);
router.post('/requestTechSupport', authenticateJWT, requestTechSupport);

router.post('/accessToken', accessToken);
router.post('/refreshToken', refreshToken);
router.post('/checkToken', checkToken);

router.use('/auth', AuthRouter);
router.use('/admin', AdminRouter);

module.exports = router;
