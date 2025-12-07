const {GamesModel} = require('../models/GamesModel');
const {UsersModel} = require("../models/UsersModel");
const {AdminUserContactsModel} = require("../models/AdminUserContactsModel");
const {NewsModel} = require("../models/NewsModel");
const {ChannelsModel} = require("../models/ChannelsModel");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const geoip = require('geoip-lite');
const sanitizeHtml = require("sanitize-html");
const he = require('he');
const {authenticateJWT} = require("../middlewares/jwtAuth");

function cleanEditorContent(content) {

    let decoded = he.decode(content);
    // decoded = decoded
    // .replace(/<div>(?:\s|<br>|&nbsp;)*<\/div>/g, '')
    // .replace(/<span[^>]*>\s*(<ul>[\s\S]*?<\/ul>)\s*<\/span>/g, '$1')
    // .replace(/<span[^>]*>\s*(<li[^>]*>[\s\S]*?<\/li>)\s*<\/span>/g, '$1')
    // .replace(/<span[^>]*>([^<]+)<\/span>/g, '$1')
    // .replace(/<br\s*\/?>/gi, '<span>&nbsp;</span>');

    const clean = sanitizeHtml(decoded, {
        allowedTags: ['ul','li','ol','p','b','i','u','strong','h1','h2','h3','h4','h5','h6','em','a','br','img'],
        allowedAttributes: {
            'a': ['href', 'target'],
            'img': ['src', 'alt']
        }
    });

    return clean;
}

require('dotenv').config();

function getRandomId(ids) {
    const randomId = Math.floor(Math.random() * ids.length);
    return ids[randomId];
}

function generateRandomSymbols() {
    let result = '';
    let symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!№;%:?*()_+=";
    for (let i = 0; i < 200; i++) {
        result += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
    return result;
}

class PostController {
    static createGame = async (req, res, next) => {
        try {
            const {game_name} = req.body;
            const user = req.user;
            const serverKey = generateRandomSymbols();

            const userId = await UsersModel.findById(user.id);

            const newGame = new GamesModel({
                game_name,
                game_access: 'General',
                game_expiresInSeconds: 100,
                expiresInMinutes: 60,
                game_author: {
                    name: user.name,
                    email: user.email,
                    id: user.id
                },
                game_online: {
                    max_online: 2,
                    online: 0,
                },
                game_type: 'Open',
                game_start_type: 'Auto',
                server_key: serverKey
            })
            await newGame.save();

            userId.myGames.push({gameId: newGame._id});
            await userId.save();

            return res.redirect(`/redaction/${newGame._id}`);
        } catch (err){
            console.error(err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static redaction = async (req, res, next) => {
        try {
            const { game_id } = req.params;
            const {
                game_name, game_access, max_online, game_expiresInSeconds, game_start_type,
            } = req.body;

            const updateFields = {};

            if (game_name) updateFields.game_name = game_name;
            if (game_access) {
                updateFields.game_access = game_access;
                updateFields.expiresInMinutes = 60;
            }
            if (max_online) updateFields["game_online.max_online"] = max_online;
            if (game_expiresInSeconds) updateFields.game_expiresInSeconds = game_expiresInSeconds < 5 ? 100 : game_expiresInSeconds;
            if (game_start_type) updateFields.game_start_type = game_start_type;

            if (Object.keys(updateFields).length > 0) {
                await GamesModel.findOneAndUpdate(
                    { _id: game_id },
                    { $set: updateFields },
                    { new: true }
                );
            }

            return res.redirect(`/redaction/${game_id}`);
        } catch (err) {
            console.error(err);
            next(err);
        }
    };

    static createQuestion = async (req, res, next) => {
        try {
            const { game_id } = req.params;
            const gameId = await GamesModel.findById(game_id);
            const {
                question_title, question_title_correct_question,
                question_title_question_1, question_title_question_2, question_title_question_3, question_title_question_4,
                delImg
            } = req.body;

            const updateFields = {};

            let imagePath;
            if (req.files && req.files.question_image) {
                const imageFile = req.files.question_image;

                const fileExt = path.extname(imageFile.name);
                const safeFileName = `${gameId.id + '-' + uuidv4()}${fileExt}`;
                imagePath = `/uploads/gameImages/${safeFileName}`;

                const uploadDir = path.join(__dirname, '..', 'public', 'uploads/gameImages');
                const savePath = path.join(uploadDir, safeFileName);

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                await imageFile.mv(savePath, (err) => {
                    if (err) {
                        console.error('Ошибка при сохранении файла:', err);
                        return res.status(500).json({ error: 'Ошибка при сохранении файла' });
                    }
                });
            }

            const imageIndex = await GamesModel.findById(game_id);

            const imageValue = imageIndex.game_questions && imageIndex.game_questions
                ? imageIndex.game_questions.question_image
                : '/images/defaultQuestionImg.png';

            updateFields[`game_questions`] = {
                question_title: question_title,
                question_image: req.body[delImg] === 'on'
                    ? '/images/defaultQuestionImg.png'
                    : imagePath || imageValue,
                question_1: {title: question_title_question_1},
                question_2: {title: question_title_question_2},
                question_3: {title: question_title_question_3},
                question_4: {title: question_title_question_4},
                correct_question: question_title_correct_question,
                question_number: imageIndex.game_questions.length
            };

            await GamesModel.findOneAndUpdate(
                { _id: game_id },
                { $push: updateFields },
                { new: true }
            );

            return res.redirect(`/create-questions/${game_id}`);

        } catch (err) {
            console.error(err);
            next(err);
        }
    };

    static editQuestion = async (req, res, next) => {
        try {
            const { game_id, question_id } = req.params;
            const gameId = await GamesModel.findById(game_id);
            const {
                question_title, question_title_correct_question,
                question_title_question_1, question_title_question_2, question_title_question_3, question_title_question_4,
                delImg
            } = req.body;

            let updateFields = {};

            let imagePath;
            if (req.files && req.files.question_image) {
                const imageFile = req.files.question_image;

                const fileExt = path.extname(imageFile.name);
                const safeFileName = `${gameId.id + '-' + uuidv4()}${fileExt}`;
                imagePath = `/uploads/gameImages/${safeFileName}`;

                const uploadDir = path.join(__dirname, '..', 'public', 'uploads/gameImages');
                const savePath = path.join(uploadDir, safeFileName);

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                await imageFile.mv(savePath, (err) => {
                    if (err) {
                        console.error('Ошибка при сохранении файла:', err);
                        return res.status(500).json({ error: 'Ошибка при сохранении файла' });
                    }
                });
            }

            const imageIndex = gameId.game_questions.find(q => q.id.toString() === question_id.toString());

            console.log('imageIndex', imageIndex);

            const imageValue = imageIndex && imageIndex.question_image
                ? imageIndex.question_image
                : '/images/defaultQuestionImg.png';

            updateFields = {
                question_title: question_title,
                question_image: delImg === 'on'
                    ? '/images/defaultQuestionImg.png'
                    : imagePath || imageValue,
                question_1: {title: question_title_question_1},
                question_2: {title: question_title_question_2},
                question_3: {title: question_title_question_3},
                question_4: {title: question_title_question_4},
                correct_question: question_title_correct_question,
                question_number: imageIndex.question_number,
                _id: imageIndex._id
            };

            await GamesModel.findOneAndUpdate(
                { _id: game_id },
                {
                    $set: {
                        'game_questions.$[elem]': updateFields
                    }
                },
                {
                    arrayFilters: [{ 'elem._id': question_id }],
                    new: true
                }
            );

            return res.redirect(`/edit-question/${game_id}/${question_id}`);

        } catch (err) {
            console.error(err);
            next(err);
        }
    };

    static deleteQuestion = async (req, res, next) => {
        try {
            const bData = req.basicData;

            const { game_id, question_id } = req.params;
            const game = await GamesModel.findById(game_id);

            if (game.game_online.online > 0){
                const errorMsg = bData.locale === 'en' ? 'You cannot edit a game that contains players.' : 'Вы не можете редактировать игру, в котором есть игрки.';
                return res.redirect(`/error?code=409&message=${encodeURIComponent(errorMsg)}`);
            }
            const user = req.user;

            const getUserInfo = await UsersModel.findById(user.id);
            const myGamesInfo = getUserInfo.myGames.map(games => games.gameId.toString());
            if (!myGamesInfo.includes(game_id)) {
                const errorMsg = bData.locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const questionId = game.game_questions.find(q => q.id.toString() === question_id.toString());
            if (!questionId) {
                const errorMsg = bData.locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            await GamesModel.findOneAndUpdate(
                { _id: game_id },
                {
                    $pull: {
                        'game_questions': {_id: question_id}
                    },
                },
                { new: true }
            )
            return res.status(200).json('Изменения успешно загружены' );
        } catch (err) {
            console.error(err);
            next(err);
        }
    };

    static deleteGame = async (req, res, next) => {
        try {
            const bData = req.basicData;

            const { game_id } = req.params;
            const game = await GamesModel.findById(game_id);
            const user = req.user;

            if (game.game_online.online > 0){
                const errorMsg = bData.locale === 'en' ? 'You cannot Delete a game that has players in it.' : 'Вы не можете Удалить игру, в котором есть игроки.';
                return res.redirect(`/error?code=409&message=${encodeURIComponent(errorMsg)}`);
            }
            const userInfo = await UsersModel.findById(user.id);

            const notFound = !userInfo.myGames.some(g => g.gameId.toString() === game_id.toString());

            if (notFound) {
                const errorMsg = bData.locale === 'en' ? 'Game not found.' : 'Игра не найдена.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }
            await GamesModel.findByIdAndDelete(game_id);
            return res.status(200).json('Игра успешно удалена!');
        } catch (err) {
            console.error(err);
            next(err);
        }
    }

    static deleteAllGames = async (req, res, next) => {
        try {
            const user = req.user;
            await UsersModel.findOneAndUpdate(
                { _id: user.id },
                {
                    $set: {myGames: []}
                },
                { new: true }
            )
        }catch(err){
            console.error(err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static getData = async (req, res, next) => {
        try {
            if (req.cookies['token']) {
                const {game_id} = req.params;
                const getData = await GamesModel.findById(game_id);
                const gameQuestions = getData.game_questions;
                const gameType = getData.game_type

                res.json({gameQuestions, gameType});
            }
        }catch (err){
            console.error('Ошибка:', err);
            res.status(500).json({error: err.message});
            next(err);
        }
    }

    static getUserData = async (req, res, next) => {
        try {
            if (req.cookies['token']) {
                const user = req.user
                const getData = await UsersModel.findById(user.id);

                const myFriends = getData.myFriends;
                const id = getData.id;

                res.json({myFriends, id});
            }
        }catch (err){
            console.error('Ошибка:', err);
            res.status(500).json({error: err.message});
            next(err);
        }
    }

    static changeAvatar = async (req, res, next)=> {
        try {
            const bData = req.basicData;

            const { action_type } = req.params;
            const user = req.user;

            if (action_type === 'delete') {
                const userInfo = await UsersModel.findById(user.id);

                if (!userInfo || !userInfo.image) {
                    return res.status(404).json({ error: 'Пользователь или изображение не найдено' });
                }

                await UsersModel.findByIdAndUpdate(userInfo._id, { $set: { image: "/images/defaultUser.png" } });

                return res.status(200).json('Картинка успешно удалена');
            }

            if (!req.cookies['locale']) {
                res.cookie('locale', bData.locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            if (!req.files.image.mimetype.startsWith('image/')) {
                const errorMsg = bData.locale === 'en' ? 'Only image files are allowed.' : 'Разрешены только файлы изображений.';
                return res.redirect(`/error?code=409&message=${encodeURIComponent(errorMsg)}`);
            }

            if (!req.files || !req.files.image){
                const errorMsg = bData.locale === 'en' ? 'Failed to load changes.' : 'Не удалось загрузить изменения.';
                return res.redirect(`/error?code=409&message=${encodeURIComponent(errorMsg)}`);
            }

            const imageFile = req.files.image;
            const fileExt = path.extname(imageFile.name);
            const safeFileName = `${user.id + '-' + uuidv4()}${fileExt}`;
            const imagePath = `/uploads/userImages/${safeFileName}`;

            const uploadDir = path.join(__dirname, '..', 'public', 'uploads/userImages');
            const savePath = path.join(uploadDir, safeFileName);

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            imageFile.mv(savePath, (err) => {
                if (err) {
                    console.error('Ошибка при сохранении файла:', err);
                    return res.status(500).json({ error: 'Ошибка при сохранении файла' });
                }
            });

            await UsersModel.findByIdAndUpdate(user.id, { $set: { image: imagePath } }
            );

            return res.status(200).json('Изменения успешно загружены' );
        } catch (err){
            console.log(err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static deleteAvatar = async (req, res, next) => {
        try {
            const user = req.user;

            const userInfo = await UsersModel.findById(user.id);

            if (!userInfo || !userInfo.image) {
                return res.status(404).json({ error: 'Пользователь или изображение не найдено' });
            }

            await UsersModel.findByIdAndUpdate(userInfo._id, { $set: { image: "/images/defaultUser.png" } });

            return res.status(200).json('Картинка успешно удалена');
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static changeBackgroundImage = async (req, res, next) => {
        try {
            const bData = req.basicData;

            const { action_type } = req.params;
            const user = req.user;
            const userId = await UsersModel.findById(user.id);

            if (action_type === 'delete') {
                if (!userId || !userId.image) {
                    return res.status(404).json({ error: 'Пользователь или изображение не найдено' });
                }

                await UsersModel.findByIdAndUpdate(
                    user.id,
                    {
                        $set: {
                            'settings.mainBackgroundImage': "/images/kahoot2.png"
                        }
                    },
                    { new: true }
                );

                return res.status(200).json('Картинка успешно удалена');
            }

            if (!req.cookies['locale']) {
                res.cookie('locale', bData.locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            if (!req.files.image.mimetype.startsWith('image/')) {
                const errorMsg = bData.locale === 'en' ? 'Only image files are allowed.' : 'Разрешены только файлы изображений.';
                return res.redirect(`/error?code=409&message=${encodeURIComponent(errorMsg)}`);
            }

            if(!req.files || !req.files.image){
                const errorMsg = bData.locale === 'en' ? 'Failed to load changes.' : 'Не удалось загрузить изменения.';
                return res.redirect(`/error?code=409&message=${encodeURIComponent(errorMsg)}`);
            }
            const imageFile = req.files.image;
            const fileExt = path.extname(imageFile.name);
            const safeFileName = `${user.id + '-' + uuidv4()}${fileExt}`;
            const imagePath = `/uploads/profileImages/${safeFileName}`;

            const uploadDir = path.join(__dirname, '..', 'public', 'uploads/profileImages');
            const savePath = path.join(uploadDir, safeFileName);

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            imageFile.mv(savePath, (err) => {
                if (err) {
                    console.error('Ошибка при сохранении файла:', err);
                    return res.status(500).json({ error: 'Ошибка при сохранении файла' });
                }
            });

            await UsersModel.findByIdAndUpdate(
                user.id,
                {
                    $set: {
                        'settings.mainBackgroundImage': imagePath
                    }
                },
                { new: true }
            );

            return res.status(200).json('Изменения успешно загружены' );
        } catch (err){
            console.log(err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static deleteBackgroundImage = async (req, res, next) => {
        try {
            const user = req.user;

            const userId = await UsersModel.findById(user.id);
            if (!userId || !userId.image) {
                return res.status(404).json({ error: 'Пользователь или изображение не найдено' });
            }

            await UsersModel.findByIdAndUpdate(
                user.id,
                {
                    $set: {
                        'settings.mainBackgroundImage': "/images/kahoot2.png"
                    }
                },
                { new: true }
            );

            return res.status(200).json('Картинка успешно удалена');
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static changeLocale = async (req, res, next) => {
        try {
            const {locale, autoUpdate} = req.params;

            res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });

            if (autoUpdate) {
                return res.redirect('/');
            } else {
                res.json({ locale });
            }
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    };

    static changeSettings = async (req, res, next) => {
        try {
            const {authType} = req.params;

            if (authType === 'notAuth') {
                const {darkTheme} = req.body;
                console.log('darkTheme', darkTheme);
                res.cookie('darkTheme', darkTheme, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
                return res.status(200).json({ message: 'Тема изменена!' });
            }

            await authenticateJWT(req, res, async () => {
                const {notifications, soundTrack, mainEffects, darkTheme} = req.body;
                const user = req.user;

                res.cookie('notifications', notifications ? 'on' : 'off', { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
                res.cookie('soundTrack', soundTrack ? 'on' : 'off', { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
                res.cookie('mainEffects', mainEffects ? 'on' : 'off', { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
                res.cookie('darkTheme', darkTheme ? 'on' : 'off', { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });

                await UsersModel.findByIdAndUpdate(
                    user.id,
                    {
                        $set: {
                            'settings.notifications': notifications ? 'on' : 'off',
                            'settings.soundTrack': soundTrack ? 'on' : 'off',
                            'settings.mainEffects': mainEffects ? 'on' : 'off',
                            'settings.darkTheme': darkTheme ? 'on' : 'off'
                        }
                    },
                    { new: true }
                );

                setTimeout(function () {
                    return res.redirect('/settings');
                }, 1000);
            });
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static changeStatus = async (req, res, next) => {
        try {
            const user = req.user;
            const {status} = req.body;

            await UsersModel.findByIdAndUpdate(
                user.id,
                {
                    $set: {
                        'settings.status': status.slice(0, 90)
                    }
                },
                { new: true }
            );

            setTimeout(function () {
                return res.redirect('/settings');
            }, 1000);

        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static changeAboutMe = async (req, res, next) => {
        try {
            const user = req.user;
            const {aboutMe} = req.body;

            const cleanBeforeLink = sanitizeHtml(aboutMe, {
                allowedTags: ['b', 'i', 'em', 'strong', 'br'],
            });

            await UsersModel.findByIdAndUpdate(
                user.id,
                {
                    $set: {
                        'settings.aboutMe': cleanBeforeLink.slice(0, 200)
                    }
                },
                { new: true }
            );

            setTimeout(function () {
                return res.redirect('/settings');
            }, 1000);

        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static sendContacts = async (req, res, next) => {
        try {
            const {name, email, message} = req.body;

            const sendContacts = new AdminUserContactsModel({
                name: name,
                email: email,
                message: message
            })
            sendContacts.save();

            return res.redirect('/support');
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    };

    static postNews = async (req, res, next) => {
        try {
            const {mainTitle} = req.body;
            const user = req.user;

            const postNews = new NewsModel({
                author: {
                    authorName: user.name,
                    authorId: user.id
                },
                mainContent: {
                    mainTitle: mainTitle
                }
            })
            postNews.save();

            const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'newsImages');
            const newsDir = path.join(uploadDir, postNews.id);

            if (!fs.existsSync(newsDir)) {
                fs.mkdirSync(newsDir, { recursive: true });
            }

            if (req.files && req.files.image) {
                const imageFile = req.files.image;
                const imagePath = path.join(newsDir, imageFile.name);

                await imageFile.mv(imagePath);

                console.log('Изображение сохранено по пути:', imagePath);
            }

            return res.redirect(`/admin/redaction-news/${postNews._id}`);
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    };

    static postImage = async (req, res, next) => {
        try {
            const {postType} = req.params;
            const {newsId} = req.body;
            const newsInfo = await NewsModel.findById(newsId);

            if (req.body['delImg'] && req.body['delImg'] === 'true') {
                console.log('delete img', req.body['deleteImg']);
                await NewsModel.findOneAndUpdate(
                    { _id: newsInfo._id, },
                    { $set: { 'mainContent.mainImage': '' } },
                    { new: true }
                );
                return;
            }

            if (!req.files || !req.files.file) {
                return res.status(400).json({ error: 'Файл не найден' });
            }

            const imageFile = req.files.file;

            console.log('imageFile', imageFile);
            const fileExt = path.extname(imageFile.name);
            const fileName = `${newsId}-${uuidv4()}${fileExt}`;
            const safeFileName = `/uploads/newsImages/${newsId}/${fileName}`;

            console.log('safeFileName', safeFileName);

            const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'newsImages', newsId);
            const savePath = path.join(uploadDir, fileName);

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            await new Promise((resolve, reject) => {
                imageFile.mv(savePath, (err) => {
                    if (err) {
                        console.error('Ошибка при сохранении файла:', err);
                        return reject(new Error('Ошибка при сохранении файла'));
                    }
                    resolve();
                });
            });

            if (postType === 'withoutJson') {
                const updated = await NewsModel.findOneAndUpdate(
                    { _id: newsInfo._id, },
                    { $set: { 'mainContent.mainImage': safeFileName } },
                    { new: true }
                );

                console.log('safeFileName', safeFileName);
                if (!updated) {
                    console.error('News not found for ID:', newsId);
                } else {
                    console.log('Image added successfully:', updated.mainContent.mainImage);
                }
            } else {
                return res.status(200).json({ fileName: safeFileName });
            }
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static redactionNews = async (req, res, next) => {
        try {
            const bData = req.basicData;

            const {newsId} = req.body;

            const user = req.user;

            const currentDate = new Date();

            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const day = currentDate.getDate().toString().padStart(2, '0');

            const dateOnly = `${day}.${month}.${year}`;

            if (!req.cookies['locale']) {
                res.cookie('locale', bData.locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            const {mainTitle, mainSummary, updateDate, isVisibility} = req.body;
            const {updatesTag, aboutGameTag, bugsErrorsTag} = req.body;
            // const {delImg} = req.body;
            const {content} = req.body;

            console.log('content', content);

            const updateFields = {};

            const getData = await UsersModel.findById(user.id);

            // updateFields.mainContent = {
            //     'mainTitle': mainTitle,
            //     'mainSummary': mainSummary,
            // };

            if (updateDate === 'on') updateFields.fullDate = new Date;
            isVisibility === true ? updateFields.isVisibility = false : updateFields.isVisibility = true;

            if (updateDate) updateFields.date = dateOnly;

            if (mainTitle) updateFields.author = {
                authorName: getData.name,
                authorId: getData.id
            };

            const text = cleanEditorContent(content);
            if (mainTitle) updateFields.content = text;

            if (!updateFields["tags"]) {
                updateFields["tags"] = [];
            }

            if (updatesTag) updateFields["tags"].push({ tagName: 'Updates' });
            if (aboutGameTag) updateFields["tags"].push({ tagName: 'AboutGame' });
            if (bugsErrorsTag) updateFields["tags"].push({ tagName: 'BugsErrors' });

            await NewsModel.findOneAndUpdate(
                { _id: newsId },
                { $set:
                    updateFields,
                    'mainContent.mainTitle': mainTitle,
                    'mainContent.mainSummary': mainSummary,
                },
                { new: true }
            )

            return res.status(200).json({ message: 'success' });
            // return res.redirect(`/admin/redaction-news/${news_id}`);
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    };

    static viewNews = async (req, res, next) => {
        try {
            const {news_id} = req.params;
            const viewNews = await NewsModel.findById(news_id);

            await NewsModel.findOneAndUpdate(
                { _id: news_id },
                {
                    $set: {
                        views: viewNews.views + 1
                    },
                },
                { new: true }
            )
            return res.redirect(`/read-news/${news_id}`);
        }catch (err){
            console.error(err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static deleteNews = async (req, res, next) => {
        try {
            const {news_id} = req.params;
            const user = req.user;

            const newsInfo = await NewsModel.findById(news_id);

            if (newsInfo) {
                await NewsModel.findByIdAndDelete(news_id)

                const filePath = path.join(__dirname, '..', 'public', 'uploads/newsImages', newsInfo.id);

                fs.rmdir(filePath, { recursive: true, force: true }, (err) => {
                    if (err) {
                        console.error('Ошибка при удалении папки:', err);
                        return;
                    }
                    console.log('Папка успешно удалена');
                });
            }

            return res.redirect(user.role === 'Admin' ? '/admin/list-news' : '/news');
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    };

    static deleteUser = async (req, res, next) => {
        try {
            const {user_id} = req.params;
            await UsersModel.findByIdAndDelete(user_id);

            return res.redirect('/admin/list-users');
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    };

    static checkToken = async (req, res, next) => {
        try {
            const token = req.cookies['token'];

            res.json({token});
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    };

    static languageConfirmation = async (req, res, next) => {
        try {
            const ip = req.cookies['ip'];
            const geo = geoip.lookup(ip);
            const country = geo.country;

            if (
                country === 'RU' || country === 'BY' || country === 'KZ' || country === 'KG' ||
                country === 'MD' || country === 'TJ' || country === 'TM' || country === 'UZ' ||
                country === 'AM' || country === 'AZ' || country === 'GE' || country === 'UA'
            ) {
                res.status(200).json({ message: 'Язык изменён на русский.' });
            } else {
                res.status(201).json({ message: 'Язык изменён на английский.' });
            }
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    };

    static checkChannel = async (req, res, next) => {
        try {
            const {user_id} = req.params;
            const user = req.user;
            const userId = await UsersModel.findById(user.id);

            const userInfo = await UsersModel.findById(user_id);

            if (!userInfo) return res.status(404).json({ error: 'Пользователь не найден' });

            const channel = await ChannelsModel.findOne({
                'channelUsers.id': { $all: [user.id, userInfo.id] }
            });

            if (channel && user.id !== userInfo.id) {
                const channelUserHas = channel.channelUsers.map(c => c.id.toString() === user.id.toString());
                const userChannelHas = userId.myChannels.map(c => c.channelId.toString() === channel._id.toString());

                console.log(' channelUserHas', channelUserHas, '\n', 'userChannelHas', userChannelHas);
                if (channelUserHas.includes(true) && !userChannelHas.includes(true)){
                    console.log('test 1');
                    userId.myChannels.push({channelId: channel._id, companionId: userInfo.id, companionName: userInfo.name});
                    await userId.save();
                    return res.json({channelId: channel._id});
                }
                return res.json({channelId: channel._id});
            }
            else {
                const newChannel = new ChannelsModel({
                    channelUsers: [
                        { id: user.id, name: user.name },
                        { id: userInfo.id, name: userInfo.name }
                    ],
                });

                await newChannel.save();

                userId.myChannels.push({channelId: newChannel._id, companionId: userInfo.id, companionName: userInfo.name});
                await userId.save();

                userInfo.myChannels.push({channelId: newChannel._id, companionId: user.id, companionName: user.name});
                await userInfo.save();

                return res.json({channelId: newChannel._id});
            }
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    };

    static deleteMyChannel = async (req, res, next) => {
        try {
            const {channel_id} = req.params;
            const user = req.user;

            await UsersModel.findOneAndUpdate(
                { _id: user.id },
                {
                    $pull: {
                        'myChannels': {channelId: channel_id}
                    },
                },
                { new: true }
            )
            return res.status(200).json('Канал успешно удалён!');
        } catch (err){
            console.error(err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static requestTechSupport = async (req, res, next) => {
        try {
            const bData = req.basicData;

            const allAdmins = await UsersModel.find({role: 'TechSupport'});

            const adminId = allAdmins.map(i => i._id);

            const randomId = getRandomId(adminId);
            if (!randomId) {
                const errorMsg = bData.locale === 'en' ? 'Failed to contact technical support. Please try again later.' : 'Не удалось связаться с тех. поддержкой. Пожалуйста, повторите попытку чуть позже.'
                return res.status(404).json({error: errorMsg});
            }

            return res.status(200).json({id: randomId});
        } catch (err){
            console.error(err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }


    static addRole = async (req, res, next) => {
        try {
            const bData = req.basicData;

            const {email, role} = req.body;

            const userInfo = await UsersModel.findOne({email});

            if (!userInfo) {
                const errorMsg = bData.locale === 'en' ? 'User not found.' : 'Игрок не найден.';
                return res.status(404).json({error: errorMsg});
            }

            await UsersModel.findOneAndUpdate(
                { _id: userInfo.id },
                {
                    $set: {
                        role: role
                    }
                },
                { new: true }
            )
            return res.status(200).json('Роль успешно изменена!');
        } catch (err){
            console.error(err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static sendReview = async (req, res, next) => {
        try {
            const bData = req.basicData;

            const user = req.user;
            const userInfo = await UsersModel.findById(user.id);

            const {review, grade} = req.body;
            const currentDate = new Date();

            if (!review) {
                const errorMsg = bData.locale === 'en' ? 'Please fill in all input fields.' : 'Пожалуйста, заполните все поля ввода.';
                return res.status(400).json({ error: errorMsg });
            }

            if (review === userInfo.settings.myReview.review && grade.toString() === userInfo.settings.myReview.grade.toString()) {
                const errorMsg = bData.locale === 'en' ? 'No changes were found in the review.' : 'В отзыве не обнаружено никаких изменений.';
                return res.status(400).json({ error: errorMsg });
            }

            await UsersModel.findByIdAndUpdate(
                userInfo.id,
                {
                    $set: {
                        'settings.myReview.review': review,
                        'settings.myReview.grade': grade,
                        'settings.myReview.date': currentDate
                    }
                },
                { new: true }
            );

            const successMsg = bData.locale === 'en' ? 'Review successfully added!' : 'Отзыв успешно добавлен!';
            return res.status(200).json({ message: successMsg });

        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static deleteMyReview = async (req, res, next) => {
        try {
            const bData = req.basicData;

            const user = req.user;

            await UsersModel.findByIdAndUpdate(user.id, { $set: { 'settings.myReview': {} } });

            const successMsg = bData.locale === 'en' ? 'Review successfully deleted!' : 'Отзыв успешно удалён!';
            return res.status(200).json({ message: successMsg });

        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static deleteReview = async (req, res, next) => {
        try {
            const { review_id } = req.params;
            const userInfo = await UsersModel.findById(review_id);

            if (!userInfo) {
                return res.status(404).json({ error: 'Пользователь или изображение не найдено' });
            }

            await UsersModel.findByIdAndUpdate(userInfo._id, { $set: { 'settings.myReview': {} } });

            return res.redirect('/admin/list-reviews')
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

}

module.exports = PostController;