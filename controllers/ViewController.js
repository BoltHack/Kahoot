const mongoose = require('mongoose');
const {UsersModel} = require('../models/UsersModel')
const {GamesModel} = require("../models/GamesModel");
class ViewController {
    static mainView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const acceptCookies = req.cookies['acceptCookies'];
            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }
            return res.render(locale === 'en' ? 'en/main' : 'ru/main', {locale, acceptCookies});
        } catch (e) {
            next(e);
        }
    }

    static createGameView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            return res.render(locale === 'en' ? 'en/create-game' : 'ru/create-game', {locale});
        } catch (e) {
            next(e);
        }
    }
    static gameView = async (req, res, next) => {
        try {
            const {game_id} = req.params;

            const soundTrack = req.cookies['soundTrack'];

            const user = req.user;
            const gameId = await GamesModel.findById(game_id);

            const checkId = await GamesModel.find({});
            const getId = checkId.map(doc => doc.id);
            if (!mongoose.Types.ObjectId.isValid(game_id)) {
                return res.status(400).send('Invalid ID');
            }
            if (!getId.includes(game_id)){
                return res.redirect(`/error?message=${encodeURIComponent('Игра не найдена.')}`);
            }
            const userId = await UsersModel.findById(user.id);

            const myGame = userId.current_game;

            const id = user.id;
            await UsersModel.findByIdAndUpdate(id, { $set: { current_game: game_id }, game: { game_id: user.id, game_name: user.name, game_answers: 0, game_correct_answers: 0 } });
            await GamesModel.findByIdAndUpdate(game_id, { $set: { expiresInMinutes: 60 } });
            console.log('добавлено', game_id);
            gameId.game_users.push({userId: user.id});
            await gameId.save();

            return res.render(locale === 'en' ? 'en/game' : 'ru/game', {user, myGame, gameId, soundTrack});
        } catch (e) {
            next(e);
        }
    }

    static redactionView = async (req, res, next) => {
        try {
            const { game_id } = req.params;
            const game = await GamesModel.findById(game_id);

            if (game.game_online.online > 0){
                return res.redirect(`/error?message=${encodeURIComponent('Вы не можете редактировать игру, в котором есть пользователи.')}`);
            }

            const locale = req.cookies['locale'] || 'en';

            const user = req.user;

            const getUserId = await UsersModel.findById(user.id);
            if (!getUserId) {
                return res.redirect(`/error?message=${encodeURIComponent('Пользователь не найден.')}`);
            }
            const myGamesId = getUserId.myGames.map(games => games.gameId.toString());

            if (!myGamesId.includes(game_id)) {
                return res.redirect(`/error?message=${encodeURIComponent('Игра не найдена.')}`);
            }

            const gamesInfo = await GamesModel.findById(game_id);
            if (!gamesInfo) {
                return res.redirect(`/error?message=${encodeURIComponent('Игра не найдена.')}`);
            }

            return res.render(locale === 'en' ? 'en/redaction' : 'ru/redaction', { user, game_id, gamesInfo, locale });
        } catch (e) {
            next(e);
        }
    }

    static myGamesView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';

            const user = req.user;

            const getUserId = await UsersModel.findById(user.id);

            const myGamesId = getUserId.myGames.map(games => games.gameId);
            const myGames = await GamesModel.find({ _id: { $in: myGamesId } });

            return res.render(locale === 'en' ? 'en/my-games' : 'ru/my-games', {getUserId, myGames, locale});
        } catch (e) {
            next(e);
        }
    }

    static shopView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            return res.render(locale === 'en' ? 'en/shop' : 'ru/shop', {locale});
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
            const locale = req.cookies['locale'];

            return res.render(locale === 'en' ? 'en/settings' : 'ru/settings', {user, userId, theme, notifications, soundTrack, locale });
        } catch (e) {
            next(e);
        }
    }

    static returnMenuView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            return res.render(locale === 'en' ? 'en/return-menu' : 'ru/return-menu', {locale});
        } catch (e) {
            next(e);
        }
    }

    static privacyPolicyView = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            return res.render(locale === 'en' ? 'en/privacyPolicy' : 'ru/privacyPolicy', {locale});
        } catch (e) {
            next(e);
        }
    }
}

module.exports = ViewController;