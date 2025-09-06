const mongoose = require('mongoose');
const {UsersModel} = require('../models/UsersModel')
const {GamesModel} = require("../models/GamesModel");
const {NewsModel} = require("../models/NewsModel");
const {authenticateJWT} = require('../middlewares/jwtAuth');
const {ChannelsModel} = require("../models/ChannelsModel");

const ngrokLink = process.env.ngrokLink;

class ViewController {
    static mainView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            const mainEffects = req.cookies['mainEffects'] || 'on';
            const acceptCookies = req.cookies['acceptCookies'];

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, notifications, darkTheme, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }
            if (req.cookies['refreshToken']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    if (user && user.id) {
                        const getData = await UsersModel.findById(user.id);
                        const mainBackgroundImage = getData.settings.mainBackgroundImage;
                        return res.render(locale === 'en' ? 'en/main' : 'ru/main', {user, locale, notifications, darkTheme, mainEffects, acceptCookies, mainBackgroundImage});
                    }
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/main' : 'ru/main', {user: '', locale, notifications, darkTheme, mainEffects, acceptCookies, mainBackgroundImage: ''});
            }
        } catch (err) {
            next(err);
        }
    }

    static createGameView = async (req, res, next) => {
        try {
            const user = req.user;
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            return res.render(locale === 'en' ? 'en/create-game' : 'ru/create-game', {user, locale, notifications, darkTheme});
        } catch (err) {
            next(err);
        }
    }
    static gameView = async (req, res, next) => {
        try {
            const {game_id} = req.params;
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';

            if (!mongoose.Types.ObjectId.isValid(game_id)) {
                const errorMsg = locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const soundTrack = req.cookies['soundTrack'];

            const user = req.user;
            const gameId = await GamesModel.findById(game_id);

            const checkId = await GamesModel.find({});
            const getId = checkId.map(doc => doc.id);

            if (!getId.includes(game_id)){
                const errorMsg = locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const userId = await UsersModel.findById(user.id);

            const myGame = userId.current_game;

            const id = user.id;
            await UsersModel.findByIdAndUpdate(id, { $set: { current_game: game_id }, game: { game_id: user.id, game_name: user.name, game_answers: 0, game_correct_answers: 0 } });
            console.log('добавлен новый игрок:', game_id);

            return res.render(locale === 'en' ? 'en/game' : 'ru/game', {user, myGame, gameId, soundTrack, locale, notifications, darkTheme, ngrokLink});
        } catch (err) {
            next(err);
        }
    }

    static redactionView = async (req, res, next) => {
        try {
            const { game_id } = req.params;
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';

            const game = await GamesModel.findById(game_id);
            if (game.game_online.online > 0){
                const errorMsg = locale === 'en' ? 'You cannot edit a game that contains players.' : 'Вы не можете редактировать игру, в котором есть игрки.';
                return res.redirect(`/error?code=409&message=${encodeURIComponent(errorMsg)}`);
            }
            const user = req.user;

            const getUserInfo = await UsersModel.findById(user.id);
            const myGamesInfo = getUserInfo.myGames.map(games => games.gameId.toString());

            if (!myGamesInfo.includes(game_id)) {
                const errorMsg = locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const gamesInfo = await GamesModel.findById(game_id);
            if (!gamesInfo) {
                const errorMsg = locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            return res.render(locale === 'en' ? 'en/redaction' : 'ru/redaction', { user, game_id, gamesInfo, locale, notifications, darkTheme });
        } catch (err) {
            next(err);
        }
    }

    static createQuestionView = async (req, res, next) => {
        try {
            const {game_id} = req.params;
            const locale = req.cookies['locale'] || 'en';

            const game = await GamesModel.findById(game_id);
            if (game.game_online.online > 0){
                const errorMsg = locale === 'en' ? 'You cannot edit a game that contains players.' : 'Вы не можете редактировать игру, в котором есть игрки.';
                return res.redirect(`/error?code=409&message=${encodeURIComponent(errorMsg)}`);
            }
            const user = req.user;

            const getUserInfo = await UsersModel.findById(user.id);
            const myGamesInfo = getUserInfo.myGames.map(games => games.gameId.toString());

            if (!myGamesInfo.includes(game_id)) {
                const errorMsg = locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const gamesInfo = await GamesModel.findById(game_id);

            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';

            return res.render(locale === 'en' ? 'en/create-questions' : 'ru/create-questions', {user, gamesInfo, locale, notifications, darkTheme});
        } catch (err) {
            next(err);
        }
    }

    static editQuestionView = async (req, res, next) => {
        try {
            const {game_id, question_id} = req.params;

            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';

            const game = await GamesModel.findById(game_id);
            if (!game) {
                const errorMsg = locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }
            if (game.game_online.online > 0) {
                const errorMsg = locale === 'en' ? 'You cannot edit a game that contains players.' : 'Вы не можете редактировать игру, в котором есть игроки.';
                return res.redirect(`/error?code=409&message=${encodeURIComponent(errorMsg)}`);
            }

            const user = req.user;
            const userData = await UsersModel.findById(user.id);
            if (!userData) {
                const errorMsg = locale === 'en' ? 'User not found.' : 'Пользователь не найден.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const myGamesId = userData.myGames.find(g => g.gameId.toString() === game_id.toString());
            if (!myGamesId) {
                const errorMsg = locale === 'en' ? 'You do not have access to this game.' : 'У вас нет доступа к этой игре.';
                return res.redirect(`/error?code=403&message=${encodeURIComponent(errorMsg)}`);
            }

            const gamesInfo = await GamesModel.findById(myGamesId.gameId);
            if (!gamesInfo) {
                const errorMsg = locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const questionInfo = gamesInfo.game_questions.find(q => q.id.toString() === question_id.toString());
            if (!questionInfo) {
                const errorMsg = locale === 'en' ? 'Question not found.' : 'Вопрос не найден.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            return res.render(locale === 'en' ? `en/edit-question` : `ru/edit-question`, {user, game_id, questionInfo, locale, notifications, darkTheme});
        } catch (err) {
            next(err);
        }
    }


    static myGamesView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';

            const user = req.user;

            const getUserId = await UsersModel.findById(user.id);

            const myGamesId = getUserId.myGames.map(games => games.gameId);
            const myGames = await GamesModel.find({ _id: { $in: myGamesId } });

            return res.render(locale === 'en' ? 'en/my-games' : 'ru/my-games', {user, getUserId, myGames, locale, notifications, darkTheme});
        } catch (err) {
            next(err);
        }
    }

    static settingsView = async (req, res, next) => {
        try {
            const user = req.user;
            const userId = await UsersModel.findById(user.id);

            const theme = req.cookies['theme'];
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            const soundTrack = req.cookies['soundTrack'];
            const mainEffects = req.cookies['mainEffects'];
            const locale = req.cookies['locale'];

            return res.render(locale === 'en' ? 'en/settings' : 'ru/settings', {user, userId, theme, notifications, darkTheme, soundTrack, mainEffects, locale});
        } catch (err) {
            next(err);
        }
    }

    static returnMenuView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            return res.render(locale === 'en' ? 'en/return-menu' : 'ru/return-menu');
        } catch (err) {
            next(err);
        }
    }

    static privacyPolicyView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/privacyPolicy' : 'ru/privacyPolicy', {user, locale, notifications, darkTheme});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/privacyPolicy' : 'ru/privacyPolicy', {user: '', locale, notifications, darkTheme});
            }
        } catch (err) {
            next(err);
        }
    }

    static rulesView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/rules' : 'ru/rules', {user, locale, notifications, darkTheme});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/rules' : 'ru/rules', {user: '', locale, notifications, darkTheme});
            }
        } catch (err) {
            next(err);
        }
    }

    static aboutUsView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';

            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/aboutUs' : 'ru/aboutUs', {user, locale, notifications, darkTheme});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/aboutUs' : 'ru/aboutUs', {user: '', locale, notifications, darkTheme});
            }
        } catch (err) {
            next(err);
        }
    }

    static aboutDonatesView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/about-donates' : 'ru/about-donates', {user, locale, notifications, darkTheme});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/about-donates' : 'ru/about-donates', {user: '', locale, notifications, darkTheme});
            }
        } catch (err) {
            next(err);
        }
    }

    static supportView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/support' : 'ru/support', {user, locale, notifications, darkTheme});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/support' : 'ru/support', {user: '', locale, notifications, darkTheme});
            }
        } catch (err) {
            next(err);
        }
    }

    static newsView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';

            const tag = req.query.tag;
            const query = tag ? {"tags.tagName": tag} : {};
            const filteredQuery = {
                ...query,
                $or: [
                    { isVisibility: true },
                    { isVisibility: { $exists: false } }
                ],
                update: { $exists: true, $ne: [] }
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
                locale,
                notifications,
                darkTheme,
            }

            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/news' : 'ru/news', {user, ...renderData});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/news' : 'ru/news', {user: '', ...renderData});
            }
        } catch (err) {
            next(err);
        }
    }


    static readNewsView = async (req, res, next) => {
        try {
            const {news_id} = req.params;
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            const previousPage = req.cookies['previousPage'] || '/';

            const pageUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

            if (!mongoose.Types.ObjectId.isValid(news_id)) {
                const errorMsg = locale === 'en' ? 'Not found.' : 'Страница не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const readNews = await NewsModel.findById(news_id);

            if (!readNews.update[0]) {
                return res.redirect(previousPage);
            }
            if (readNews.isVisibility === false) {
                const errorMsg = locale === 'en' ? 'Not found.' : 'Страница не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const authorId = await UsersModel.findById(readNews.author.authorId);
            const authorImage = authorId.image;

            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/read-news' : 'ru/read-news', {user, readNews, authorImage, locale, notifications, darkTheme, ngrokLink, pageUrl});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/read-news' : 'ru/read-news', {user: '', readNews, authorImage, locale, notifications, darkTheme, ngrokLink, pageUrl});
            }
        } catch (err) {
            next(err);
        }
    }

    static userProfileView = async (req, res, next) => {
        try {
            const {user_id} = req.params;
            const locale = req.cookies['locale'] || 'en';

            if (!mongoose.Types.ObjectId.isValid(user_id)) {
                const errorMsg = locale === 'en' ? 'Player not found.' : 'Игрок не найден.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';

            const userInfo = await UsersModel.findById(user_id);
            if (req.cookies['refreshToken']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    const myInfo = await UsersModel.findById(user.id);
                    if (user && user.id) {
                        return res.render(locale === 'en' ? 'en/user-profile' : 'ru/user-profile', {user, userInfo, myInfo, locale, notifications, darkTheme});
                    }
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/user-profile' : 'ru/user-profile', {user: '', userInfo, locale, notifications, darkTheme});
            }
        } catch (err) {
            next(err);
        }
    }

    static channelsView = async (req, res, next) => {
        try {
            const {channel_id} = req.params;
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';

            if (!channel_id || !mongoose.Types.ObjectId.isValid(channel_id)) {
                const errorMsg = locale === 'en' ? 'Channel not found.' : 'Канал не найден.';
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
                const errorMsg = locale === 'en' ? 'this channel has been deleted.' : 'Этот канал был удалён.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            if (!match || !companion) {
                const errorMsg = locale === 'en' ? 'Channel not found.' : 'Канал не найден.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            return res.render(locale === 'en' ? 'en/channels' : 'ru/channels', { myData, channel, locale, notifications, darkTheme, companion, myChannels });
        } catch (err) {
            next(err);
        }
    }

    static channelsMeView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            const user = req.user;

            const myData = await UsersModel.findById(user.id);
            const myChannels = myData.myChannels;

            return res.render(locale === 'en' ? 'en/channelsMe' : 'ru/channelsMe', { myData, locale, notifications, darkTheme, myChannels });

        } catch (err) {
            next(err);
        }
    }

    static contactsView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/contacts' : 'ru/contacts', {user, locale, notifications, darkTheme});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/contacts' : 'ru/contacts', {user: '', locale, notifications, darkTheme});
            }
        } catch (err) {
            next(err);
        }
    }

    static reviewsView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const darkTheme = req.cookies['darkTheme'] || 'on';

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
                usersLength, locale, notifications, darkTheme
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

                    return res.render(locale === 'en' ? 'en/reviews' : 'ru/reviews', {user, ...renderData, myInfo });
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/reviews' : 'ru/reviews', { user: '', ...renderData, myInfo: '' });
            }
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ViewController;