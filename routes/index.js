const express = require('express');
const AuthRouter = require('./AuthRouter');
const AdminRouter = require('./AdminRouter');

const {
    mainView, createGameView, gameView, redactionView, myGamesView, settingsView, returnMenuView,
    privacyPolicyView, rulesView, aboutUsView, supportView, newsView, readNewsView, aboutDonatesView,
    userProfileView, channelsView, channelsMeView, createQuestionView, editQuestionView, contactsView
} = require('../controllers/ViewController');
const {
    createGame, redaction, deleteGame, deleteAllGames, getData, getUserData, changeAvatar, deleteAvatar,
    changeLocal, changeLocalAuth, changeSettings, sendContacts, viewNews, checkToken, changeBackgroundImage,
    languageConfirmation, deleteBackgroundImage, changeStatus, changeAboutMe, checkChannel, deleteMyChannel,
    createQuestion, editQuestion, deleteQuestion, requestTechSupport
} = require('../controllers/PostController');
const {authenticateJWT} = require('../middlewares/jwtAuth');
const {accessToken} = require('../middlewares/updateAccessToken');
const {refreshToken} = require('../middlewares/updateRefreshToken');
const router = express.Router();

router.get('/', mainView);
router.get('/create-game', authenticateJWT, createGameView);
router.get('/game/:game_id', authenticateJWT, gameView);
router.get('/redaction/:game_id', authenticateJWT, redactionView);
router.get('/edit-question/:game_id/:question_id', authenticateJWT, editQuestionView);
router.get('/create-questions/:game_id', authenticateJWT, createQuestionView);
router.get('/my-games', authenticateJWT, myGamesView);

router.get('/settings', authenticateJWT, settingsView);

router.get('/return-menu', returnMenuView);

router.get('/privacyPolicy', privacyPolicyView);
router.get('/rules', rulesView);
router.get('/aboutUs', aboutUsView);
router.get('/contacts', contactsView);
router.get('/about-donates', aboutDonatesView);

router.get('/support', supportView);
router.get('/news', newsView);
router.get('/read-news/:news_id', readNewsView);
router.get('/user-profile/:user_id', userProfileView);

router.get('/channels/@me', authenticateJWT, channelsMeView);
router.get('/channels/@me/:channel_id', authenticateJWT, channelsView);


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
router.post('/changeLocal/:locale', changeLocal);
router.post('/changeLocalAuth/:locale', authenticateJWT, changeLocalAuth);
router.post('/changeSettings', authenticateJWT, changeSettings);
router.post('/changeStatus', authenticateJWT, changeStatus);
router.post('/changeAboutMe', authenticateJWT, changeAboutMe);

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
