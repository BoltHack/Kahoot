const mongoose = require('mongoose');
const {UsersModel} = require("../models/UsersModel");
const {GamesModel} = require("../models/GamesModel");
const {NewsModel} = require("../models/NewsModel");
const {authenticateJWT} = require("../middlewares/jwtAuth");
const {ChannelsModel} = require("../models/ChannelsModel");

const ngrokLink = process.env.ngrokLink;

class ViewController {
    static mainView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const mainEffects = req.cookies['mainEffects'] || 'on';
            const acceptCookies = req.cookies['acceptCookies'];

            if (req.cookies['refreshToken']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    if (user && user.id) {
                        const getData = await UsersModel.findById(user.id);
                        const mainBackgroundImage = getData.settings.mainBackgroundImage;
                        return res.render(appData.locale === 'en' ? 'en/main' : 'ru/main', { user, mainEffects, acceptCookies, mainBackgroundImage, backgroundImage: '', ...appData });
                    }
                });
            }
            else {
                return res.render(appData.locale === 'en' ? 'en/main' : 'ru/main', { user: '', mainEffects, acceptCookies, mainBackgroundImage: '', ...appData });
            }
        } catch (err) {
            next(err);
        }
    }

    static createGameView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const user = req.user;
            return res.render(appData.locale === 'en' ? 'en/create-game' : 'ru/create-game', { user, ...appData });
        } catch (err) {
            next(err);
        }
    }
    static gameView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const {game_id} = req.params;

            if (!mongoose.Types.ObjectId.isValid(game_id)) {
                const errorMsg = appData.locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const soundTrack = req.cookies['soundTrack'];

            const user = req.user;
            const gameId = await GamesModel.findById(game_id);

            const checkId = await GamesModel.find({});
            const getId = checkId.map(doc => doc.id);

            if (!getId.includes(game_id)){
                const errorMsg = appData.locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const userId = await UsersModel.findById(user.id);

            const myGame = userId.current_game;

            const id = user.id;
            await UsersModel.findByIdAndUpdate(id, { $set: { current_game: game_id }, game: { game_id: user.id, game_name: user.name, game_answers: 0, game_correct_answers: 0 } });
            console.log('добавлен новый игрок:', game_id);

            return res.render(appData.locale === 'en' ? 'en/game' : 'ru/game', { user, myGame, gameId, soundTrack, ngrokLink, ...appData });
        } catch (err) {
            next(err);
        }
    }

    static redactionView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const { game_id } = req.params;

            const game = await GamesModel.findById(game_id);
            if (game.game_online.online > 0){
                const errorMsg = appData.locale === 'en' ? 'You cannot edit a game that contains players.' : 'Вы не можете редактировать игру, в котором есть игрки.';
                return res.redirect(`/error?code=409&message=${encodeURIComponent(errorMsg)}`);
            }
            const user = req.user;

            const getUserInfo = await UsersModel.findById(user.id);
            const myGamesInfo = getUserInfo.myGames.map(games => games.gameId.toString());

            if (!myGamesInfo.includes(game_id)) {
                const errorMsg = appData.locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const gamesInfo = await GamesModel.findById(game_id);
            if (!gamesInfo) {
                const errorMsg = appData.locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            return res.render(appData.locale === 'en' ? 'en/redaction' : 'ru/redaction', { user, game_id, gamesInfo, ...appData });
        } catch (err) {
            next(err);
        }
    }

    static createQuestionView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const {game_id} = req.params;

            const game = await GamesModel.findById(game_id);
            if (game.game_online.online > 0){
                const errorMsg = appData.locale === 'en' ? 'You cannot edit a game that contains players.' : 'Вы не можете редактировать игру, в котором есть игрки.';
                return res.redirect(`/error?code=409&message=${encodeURIComponent(errorMsg)}`);
            }
            const user = req.user;

            const getUserInfo = await UsersModel.findById(user.id);
            const myGamesInfo = getUserInfo.myGames.map(games => games.gameId.toString());

            if (!myGamesInfo.includes(game_id)) {
                const errorMsg = appData.locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const gamesInfo = await GamesModel.findById(game_id);

            return res.render(appData.locale === 'en' ? 'en/create-questions' : 'ru/create-questions', { user, gamesInfo, ...appData });
        } catch (err) {
            next(err);
        }
    }

    static editQuestionView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const {game_id, question_id} = req.params;

            const game = await GamesModel.findById(game_id);
            if (!game) {
                const errorMsg = appData.locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }
            if (game.game_online.online > 0) {
                const errorMsg = appData.locale === 'en' ? 'You cannot edit a game that contains players.' : 'Вы не можете редактировать игру, в котором есть игроки.';
                return res.redirect(`/error?code=409&message=${encodeURIComponent(errorMsg)}`);
            }

            const user = req.user;
            const userData = await UsersModel.findById(user.id);
            if (!userData) {
                const errorMsg = appData.locale === 'en' ? 'User not found.' : 'Пользователь не найден.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const myGamesId = userData.myGames.find(g => g.gameId.toString() === game_id.toString());
            if (!myGamesId) {
                const errorMsg = appData.locale === 'en' ? 'You do not have access to this game.' : 'У вас нет доступа к этой игре.';
                return res.redirect(`/error?code=403&message=${encodeURIComponent(errorMsg)}`);
            }

            const gamesInfo = await GamesModel.findById(myGamesId.gameId);
            if (!gamesInfo) {
                const errorMsg = appData.locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const questionInfo = gamesInfo.game_questions.find(q => q.id.toString() === question_id.toString());
            if (!questionInfo) {
                const errorMsg = appData.locale === 'en' ? 'Question not found.' : 'Вопрос не найден.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            return res.render(appData.locale === 'en' ? `en/edit-question` : `ru/edit-question`, { user, game_id, questionInfo, ...appData });
        } catch (err) {
            next(err);
        }
    }


    static myGamesView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const user = req.user;

            const getUserId = await UsersModel.findById(user.id);

            const myGamesId = getUserId.myGames.map(games => games.gameId);
            const myGames = await GamesModel.find({ _id: { $in: myGamesId } });

            return res.render(appData.locale === 'en' ? 'en/my-games' : 'ru/my-games', {user, getUserId, myGames, ...appData });
        } catch (err) {
            next(err);
        }
    }

    static settingsView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const user = req.user;
            const userId = await UsersModel.findById(user.id);

            const theme = req.cookies['theme'];
            const soundTrack = req.cookies['soundTrack'];
            const mainEffects = req.cookies['mainEffects'];

            return res.render(appData.locale === 'en' ? 'en/settings' : 'ru/settings', { user, userId, theme, soundTrack, mainEffects, ...appData });
        } catch (err) {
            next(err);
        }
    }

    static returnMenuView = async (req, res, next) => {
        try {
            const appData = req.basicData;
            return res.render(appData.locale === 'en' ? 'en/return-menu' : 'ru/return-menu');
        } catch (err) {
            next(err);
        }
    }

    static privacyPolicyView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(appData.locale === 'en' ? 'en/privacyPolicy' : 'ru/privacyPolicy', {user, ...appData });
                });
            }
            else {
                return res.render(appData.locale === 'en' ? 'en/privacyPolicy' : 'ru/privacyPolicy', {user: '', ...appData });
            }
        } catch (err) {
            next(err);
        }
    }

    static rulesView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(appData.locale === 'en' ? 'en/rules' : 'ru/rules', { user, ...appData });
                });
            }
            else {
                return res.render(appData.locale === 'en' ? 'en/rules' : 'ru/rules', { user: '', ...appData });
            }
        } catch (err) {
            next(err);
        }
    }

    static aboutUsView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(appData.locale === 'en' ? 'en/aboutUs' : 'ru/aboutUs', { user, ...appData });
                });
            }
            else {
                return res.render(appData.locale === 'en' ? 'en/aboutUs' : 'ru/aboutUs', { user: '', ...appData });
            }
        } catch (err) {
            next(err);
        }
    }

    static aboutDonatesView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(appData.locale === 'en' ? 'en/about-donates' : 'ru/about-donates', {user, ...appData });
                });
            }
            else {
                return res.render(appData.locale === 'en' ? 'en/about-donates' : 'ru/about-donates', {user: '', ...appData });
            }
        } catch (err) {
            next(err);
        }
    }

    static supportView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    const userInfo = await UsersModel.findById(user.id);
                    return res.render(appData.locale === 'en' ? 'en/support' : 'ru/support', { user, userEmail: userInfo.email, ...appData });
                });
            }
            else {
                return res.render(appData.locale === 'en' ? 'en/support' : 'ru/support', { user: '', ...appData });
            }
        } catch (err) {
            next(err);
        }
    }

    static newsView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const tag = req.query.tag;
            const query = tag ? {"tags.tagName": tag} : {};
            const filteredQuery = {
                ...query,
                $or: [
                    { isVisibility: true },
                    { isVisibility: { $exists: false } },
                ],
                $expr: {
                    $and: [
                        { $gt: [{ $strLenCP: { $ifNull: [ '$mainContent.mainTitle', '' ] } }, 1] },
                        { $gt: [{ $strLenCP: { $ifNull: [ '$mainContent.mainSummary', '' ] } }, 1] },
                    ]
                }
            };

            const page = parseInt(req.query.page) || 1;
            const limit = 3;
            const skip = (page - 1) * limit;
            const allNews = await NewsModel.find(filteredQuery).sort({fullDate: -1})
                .skip(skip)
                .limit(limit);
            const totalNews = await NewsModel.countDocuments(filteredQuery);

            const authorIds = allNews.map(news => news.author.authorId);
            const authors = await UsersModel.find({ _id: { $in: authorIds } });
            const enrichedNews = allNews.map(news => {
                const author = authors.find(a => a._id.toString() === news.author.authorId.toString());
                return {
                    ...news.toObject(),
                    authorImage: author ? author.image : '/images/default-avatar.png'
                };
            });

            const renderData = {
                allNews: enrichedNews,
                currentPage: page,
                totalPages: Math.ceil(totalNews / limit),
                currentTag: tag,
                locale: appData.locale,
                notifications: appData.darkTheme,
                darkTheme: appData.darkTheme,
            }

            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(appData.locale === 'en' ? 'en/news' : 'ru/news', {user, ...renderData, ...appData});
                });
            }
            else {
                return res.render(appData.locale === 'en' ? 'en/news' : 'ru/news', {user: '', ...renderData, ...appData});
            }
        } catch (err) {
            next(err);
        }
    }


    static readNewsView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const {news_id} = req.params;

            const pageUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

            if (!mongoose.Types.ObjectId.isValid(news_id)) {
                const errorMsg = appData.locale === 'en' ? 'Not found.' : 'Страница не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const readNews = await NewsModel.findById(news_id);

            if (!readNews.mainContent && !readNews.mainContent.mainSummary) {
                const errorMsg = appData.locale === 'en' ? 'Not found.' : 'Страница не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }
            if (readNews.isVisibility === false) {
                const errorMsg = appData.locale === 'en' ? 'Not found.' : 'Страница не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const authorId = await UsersModel.findById(readNews.author.authorId);
            const authorImage = authorId.image;

            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(appData.locale === 'en' ? 'en/read-news' : 'ru/read-news', {user, readNews, authorImage, ngrokLink, pageUrl, ...appData});
                });
            }
            else {
                return res.render(appData.locale === 'en' ? 'en/read-news' : 'ru/read-news', {user: '', readNews, authorImage, ngrokLink, pageUrl, ...appData});
            }
        } catch (err) {
            next(err);
        }
    }

    static userProfileView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const {user_id} = req.params;

            if (!mongoose.Types.ObjectId.isValid(user_id)) {
                const errorMsg = appData.locale === 'en' ? 'Player not found.' : 'Игрок не найден.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const userInfo = await UsersModel.findById(user_id);
            if (req.cookies['refreshToken']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    const myInfo = await UsersModel.findById(user.id);
                    if (user && user.id) {
                        return res.render(appData.locale === 'en' ? 'en/user-profile' : 'ru/user-profile', {user, userInfo, myInfo, ...appData});
                    }
                });
            }
            else {
                return res.render(appData.locale === 'en' ? 'en/user-profile' : 'ru/user-profile', {user: '', userInfo, ...appData});
            }
        } catch (err) {
            next(err);
        }
    }

    static channelsView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const {channel_id} = req.params;

            if (!channel_id || !mongoose.Types.ObjectId.isValid(channel_id)) {
                const errorMsg = appData.locale === 'en' ? 'Channel not found.' : 'Канал не найден.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const user = req.user;
            const channel = await ChannelsModel.findById(channel_id);

            const myData = await UsersModel.findById(user.id);
            const myChannels = myData.myChannels;
            const match = myChannels.find(c => c.channelId === channel_id);
            const companionId = match ? match.companionId : null;
            const companion = await UsersModel.findById(companionId);

            if (match && !companion) {
                await ChannelsModel.findByIdAndDelete(channel_id);
                await UsersModel.findOneAndUpdate(
                    { _id: user.id },
                    {
                        $pull: {
                            'myChannels': {channelId: channel_id}
                        },
                    },
                    { new: true }
                )
                const errorMsg = appData.locale === 'en' ? 'this channel has been deleted.' : 'Этот канал был удалён.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            if (!match || !companion) {
                const errorMsg = appData.locale === 'en' ? 'Channel not found.' : 'Канал не найден.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            return res.render(appData.locale === 'en' ? 'en/channels' : 'ru/channels', { myData, channel, companion, myChannels, ...appData });
        } catch (err) {
            next(err);
        }
    }

    static channelsMeView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const user = req.user;

            const myData = await UsersModel.findById(user.id);
            const myChannels = myData.myChannels;

            return res.render(appData.locale === 'en' ? 'en/channelsMe' : 'ru/channelsMe', { myData, myChannels, ...appData });

        } catch (err) {
            next(err);
        }
    }

    static contactsView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(appData.locale === 'en' ? 'en/contacts' : 'ru/contacts', { user, ...appData });
                });
            }
            else {
                return res.render(appData.locale === 'en' ? 'en/contacts' : 'ru/contacts', { user: '', ...appData });
            }
        } catch (err) {
            next(err);
        }
    }

    static reviewsView = async (req, res, next) => {
        try {
            const appData = req.basicData;

            const usersLength = await UsersModel.countDocuments();

            const page = parseInt(req.query.page) || 1;
            const limit = 8;
            const skip = (page - 1) * limit;
            const filtered = {
                'settings.myReview.review': { $exists: true, $ne: '' },
            };

            const allReviews = await UsersModel.find(filtered)
                .sort({ 'settings.myReview.date': -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const reviews = allReviews.map(user => ({
                id: user._id,
                name: user.name,
                image: user.image,
                review: user.settings.myReview.review,
                grade: user.settings.myReview.grade,
                date: user.settings.myReview.date
            }));
            const totalReviews = await UsersModel.countDocuments(filtered);

            const renderData = {
                allReviews: reviews,
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit),
                usersLength,
                locale: appData.locale,
                notifications: appData.notifications,
                darkTheme: appData.darkTheme
            }

            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    const userInfo = await UsersModel.findById(user.id);
                    const myInfo = {
                        id: userInfo.id,
                        name: userInfo.name,
                        image: userInfo.image,
                        review: userInfo.settings.myReview
                    }

                    return res.render(appData.locale === 'en' ? 'en/reviews' : 'ru/reviews', {user, myInfo, ...renderData, ...appData });
                });
            }
            else {
                return res.render(appData.locale === 'en' ? 'en/reviews' : 'ru/reviews', { user: '', myInfo: '', ...renderData, ...appData });
            }
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ViewController;