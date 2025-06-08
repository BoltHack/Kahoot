const mongoose = require('mongoose');
const {UsersModel} = require('../models/UsersModel')
const {GamesModel} = require("../models/GamesModel");
const {NewsModel} = require("../models/NewsModel");
const {authenticateJWT} = require('../middlewares/jwtAuth');
const {ChannelsModel} = require("../models/ChannelsModel");
class ViewController {
    static mainView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const mainEffects = req.cookies['mainEffects'] || 'on';
            const acceptCookies = req.cookies['acceptCookies'];

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, notifications, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }
            if (req.cookies['refreshToken']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    if (user && user.id) {
                        const getData = await UsersModel.findById(user.id);
                        const mainBackgroundImage = getData.settings.mainBackgroundImage;
                        return res.render(locale === 'en' ? 'en/main' : 'ru/main', {user, locale, notifications, mainEffects, acceptCookies, mainBackgroundImage});
                    }
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/main' : 'ru/main', {user: '', locale, notifications, mainEffects, acceptCookies, mainBackgroundImage: ''});
            }
        } catch (e) {
            next(e);
        }
    }

    static createGameView = async (req, res, next) => {
        try {
            const user = req.user;
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            return res.render(locale === 'en' ? 'en/create-game' : 'ru/create-game', {user, locale, notifications});
        } catch (e) {
            next(e);
        }
    }
    static gameView = async (req, res, next) => {
        try {
            const {game_id} = req.params;
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';

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

            return res.render(locale === 'en' ? 'en/game' : 'ru/game', {user, myGame, gameId, soundTrack, locale, notifications});
        } catch (e) {
            next(e);
        }
    }

    static redactionView = async (req, res, next) => {
        try {
            const { game_id } = req.params;
            const game = await GamesModel.findById(game_id);
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';

            if (game.game_online.online > 0){
                const errorMsg = locale === 'en' ? 'You cannot edit a game that contains players.' : 'Вы не можете редактировать игру, в котором есть игрки.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const user = req.user;

            const getUserId = await UsersModel.findById(user.id);
            if (!getUserId) {
                const errorMsg = locale === 'en' ? 'Player not found.' : 'Игрок не найден.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }
            const myGamesId = getUserId.myGames.map(games => games.gameId.toString());

            if (!myGamesId.includes(game_id)) {
                const errorMsg = locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const gamesInfo = await GamesModel.findById(game_id);
            if (!gamesInfo) {
                const errorMsg = locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            return res.render(locale === 'en' ? 'en/redaction' : 'ru/redaction', { user, game_id, gamesInfo, locale });
        } catch (e) {
            next(e);
        }
    }

    static myGamesView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';

            const user = req.user;

            const getUserId = await UsersModel.findById(user.id);

            const myGamesId = getUserId.myGames.map(games => games.gameId);
            const myGames = await GamesModel.find({ _id: { $in: myGamesId } });

            return res.render(locale === 'en' ? 'en/my-games' : 'ru/my-games', {user, getUserId, myGames, locale, notifications});
        } catch (e) {
            next(e);
        }
    }

    static settingsView = async (req, res, next) => {
        try {
            const user = req.user;
            const userId = await UsersModel.findById(user.id);

            const theme = req.cookies['theme'];
            const notifications = req.cookies['notifications'];
            const soundTrack = req.cookies['soundTrack'];
            const mainEffects = req.cookies['mainEffects'];
            const locale = req.cookies['locale'];

            return res.render(locale === 'en' ? 'en/settings' : 'ru/settings', {user, userId, theme, notifications, soundTrack, mainEffects, locale});
        } catch (e) {
            next(e);
        }
    }

    static returnMenuView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            return res.render(locale === 'en' ? 'en/return-menu' : 'ru/return-menu', {locale, notifications});
        } catch (e) {
            next(e);
        }
    }

    static privacyPolicyView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/privacyPolicy' : 'ru/privacyPolicy', {user, locale, notifications});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/privacyPolicy' : 'ru/privacyPolicy', {user: '', locale, notifications});
            }
        } catch (e) {
            next(e);
        }
    }

    static rulesView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/rules' : 'ru/rules', {user, locale, notifications});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/rules' : 'ru/rules', {user: '', locale, notifications});
            }
        } catch (e) {
            next(e);
        }
    }

    static aboutUsView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/aboutUs' : 'ru/aboutUs', {user, locale, notifications});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/aboutUs' : 'ru/aboutUs', {user: '', locale, notifications});
            }
        } catch (e) {
            next(e);
        }
    }

    static aboutDonatesView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/about-donates' : 'ru/about-donates', {user, locale, notifications});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/about-donates' : 'ru/about-donates', {user: '', locale, notifications});
            }
        } catch (e) {
            next(e);
        }
    }

    static supportView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/support' : 'ru/support', {user, locale, notifications});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/support' : 'ru/support', {user: '', locale, notifications});
            }
        } catch (e) {
            next(e);
        }
    }

    static newsView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';

            const tag = req.query.tag;
            const query = tag ? {"tags.tagName": tag} : {};

            const page = parseInt(req.query.page) || 1;
            const limit = 3;
            const skip = (page - 1) * limit;
            const allNews = await NewsModel.find(query).sort({fullDate: -1}).skip(skip).limit(limit);
            const totalNews = await NewsModel.countDocuments(query);

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
                locale
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
        } catch (e) {
            next(e);
        }
    }


    static readNewsView = async (req, res, next) => {
        try {
            const {news_id} = req.params;
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';

            if (!mongoose.Types.ObjectId.isValid(news_id)) {
                const errorMsg = locale === 'en' ? 'Not found.' : 'Страница не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const readNews = await NewsModel.findById(news_id);

            const authorId = await UsersModel.findById(readNews.author.authorId);
            const authorImage = authorId.image;

            if (req.cookies['token']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    return res.render(locale === 'en' ? 'en/read-news' : 'ru/read-news', {user, readNews, authorImage, locale, notifications});
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/read-news' : 'ru/read-news', {user: '', readNews, authorImage, locale, notifications});
            }
        } catch (e) {
            next(e);
        }
    }

    static userProfileView = async (req, res, next) => {
        try {
            const {user_id} = req.params;

            if (!mongoose.Types.ObjectId.isValid(user_id)) {
                const errorMsg = locale === 'en' ? 'Player not found.' : 'Игрок не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';

            const userInfo = await UsersModel.findById(user_id);
            if (req.cookies['refreshToken']) {
                await authenticateJWT(req, res, async () => {
                    const user = req.user;
                    const myInfo = await UsersModel.findById(user.id);
                    if (user && user.id) {
                        return res.render(locale === 'en' ? 'en/user-profile' : 'ru/user-profile', {user, userInfo, myInfo, locale, notifications});
                    }
                });
            }
            else {
                return res.render(locale === 'en' ? 'en/user-profile' : 'ru/user-profile', {user: '', userInfo, locale, notifications});
            }
        } catch (e) {
            next(e);
        }
    }

    static channelsView = async (req, res, next) => {
        try {
            console.log('test 0');
            const {channel_id} = req.params;
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';

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

            if (!match) {
                const errorMsg = locale === 'en' ? 'Channel not found.' : 'Канал не найден.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            return res.render(locale === 'en' ? 'en/channels' : 'ru/channels', { myData, channel, locale, notifications, companion, myChannels });
        } catch (e) {
            next(e);
        }
    }

    static channelsMeView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const notifications = req.cookies['notifications'] || 'on';
            const user = req.user;

            const myData = await UsersModel.findById(user.id);
            const myChannels = myData.myChannels;

            return res.render(locale === 'en' ? 'en/channelsMe' : 'ru/channelsMe', { myData, locale, notifications, myChannels });

        } catch (e) {
            next(e);
        }
    }
}

module.exports = ViewController;