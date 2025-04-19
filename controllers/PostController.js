const {GamesModel} = require('../models/GamesModel')
const {UsersModel} = require("../models/UsersModel");
const {AdminUserContactsModel} = require("../models/AdminUserContactsModel");
const {NewsModel} = require("../models/NewsModel");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const {default_question_image} = process.env;

class PostController {
    static createGame = async (req, res, next) => {
        try {
            const {game_name} = req.body;
            const user = req.user;

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
                game_max_questions: 2,
                game_type: 'Open',
                game_start_type: 'Auto'
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
                game_name, game_access, max_online, game_expiresInSeconds, game_max_questions, game_start_type,
                ...questions
            } = req.body;

            const updateFields = {};

            if (game_name) updateFields.game_name = game_name;
            if (game_access) {
                updateFields.game_access = game_access;
                updateFields.expiresInMinutes = 60;
            }
            if (max_online) updateFields["game_online.max_online"] = max_online;
            if (game_expiresInSeconds) updateFields.game_expiresInSeconds = game_expiresInSeconds;
            if (game_max_questions) updateFields.game_max_questions = game_max_questions;
            if (game_start_type) updateFields.game_start_type = game_start_type;

            for (let i = 0; i < 5; i++) {
                const titleKey = `question_title${i}`;
                if (questions[titleKey]) {
                    let base64Image = default_question_image;
                    const imageKey = `question_image${i}`;
                    if (req.files && req.files[imageKey]) {
                        base64Image = req.files[imageKey].data.toString('base64');
                    }

                    updateFields[`game_questions.${i}`] = {
                        question_title: questions[titleKey],
                        question_image: base64Image,
                        question_1: { title: questions[`${titleKey}_question_1`] },
                        question_2: { title: questions[`${titleKey}_question_2`] },
                        question_3: { title: questions[`${titleKey}_question_3`] },
                        question_4: { title: questions[`${titleKey}_question_4`] },
                        correct_question: questions[`${titleKey}_correct_question`],
                        question_number: i
                    };
                }
            }

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
            res.status(500).json({ error: err.message });
            next(err);
        }
    };


    static deleteGame = async (req, res, next) => {
        try {
            const { game_id } = req.params;
            const game = await GamesModel.findById(game_id);
            const locale = req.cookies['locale'] || 'en';

            if (game.game_online.online > 0){
                const errorMsg = locale === 'en' ? 'You cannot Delete a game that has players in it.' : 'Вы не можете Удалить игру, в котором есть игроки.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }
            await GamesModel.findByIdAndDelete(game_id);
            return res.redirect('/my-games');
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
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

    static userLeader = async (req, res, next) => {
        try {
            const {game_id, game_time} = req.params;
            const user = req.user;
            const userId = await UsersModel.findById(user.id);
            console.log('answers', userId.game[0].game_answers);
            console.log('correct_answers', userId.game[0].game_correct_answers);

            const checkGameLeaderId = await GamesModel.find({ _id: game_id });

            const leaderIds = checkGameLeaderId.map(leader => leader.game_leaders);
            console.log('leaderIds', leaderIds);

            if (!leaderIds.includes(user.id)) {
                await GamesModel.findOneAndUpdate(
                    { _id: game_id },
                    {
                        $push: {
                            game_leaders: { id: user.id, name: user.name, correct_answers: userId.game[0].game_correct_answers, time: game_time }
                        },
                    },
                    { new: true }
                )
            }
        }catch (err){
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

    static changeAvatar = async (req, res, next)=>{
        try{
            const {user_id} = req.params;

            let locale = req.cookies['locale'] || 'en';

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            if (!req.files.image.mimetype.startsWith('image/')) {
                const errorMsg = locale === 'en' ? 'Only image files are allowed.' : 'Разрешены только файлы изображений.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            if(!req.files || !req.files.image){
                const errorMsg = locale === 'en' ? 'Failed to load changes.' : 'Не удалось загрузить изменения.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }
            const imageFile = req.files.image;
            const fileExt = path.extname(imageFile.name);
            const safeFileName = `${uuidv4()}${fileExt}`;
            const imagePath = `/uploads/${safeFileName}`;

            const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
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

            await UsersModel.findByIdAndUpdate(user_id, { $set: { image: imagePath } }
            );

            return res.status(200).json('Изменения успешно загружены' );
        } catch (err){
            console.log(err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }

    static deleteImage = async (req, res, next) => {
        try {
            const { user_id } = req.params;

            const user = await UsersModel.findById(user_id);

            if (!user || !user.image) {
                return res.status(404).json({ error: 'Пользователь или изображение не найдено' });
            }

            const imagePath = path.join(__dirname, '..', 'public', user.image);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                await UsersModel.findByIdAndUpdate(user_id, { $set: { image: "/images/defaultUser.png" } }
                );
                console.log('Файл удалён:', imagePath);
            } else {
                console.log('Файл не найден:', imagePath);
            }

            return res.status(200).json('Картинка успешно удалена');
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    }


    static changeLocal = async (req, res, next) => {
        try {
            const {locale} = req.params;

            res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });

            res.json({ locale });
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    };

    static changeLocalAuth = async (req, res, next) => {
        try {
            const {id} = req.params;
            const {locale} = req.params;
            await UsersModel.findByIdAndUpdate(
                id,
                {locale: locale},
                {new: true}
            )

            res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });

            res.json({ locale });
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    };

    static changeSettings = async (req, res, next) => {
        try {
            const {notifications, soundTrack, mainEffects} = req.body;

            res.cookie('notifications', notifications ? 'on' : 'off', { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
            res.cookie('soundTrack', soundTrack ? 'on' : 'off', { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
            res.cookie('mainEffects', mainEffects ? 'on' : 'off', { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });

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
            const {updateTitle} = req.body;
            const user = req.user;

            const postNews = new NewsModel({
                author: {
                    authorName: user.name,
                    authorId: user.id
                },
                updateTitle: updateTitle
            })
            postNews.save();

            return res.redirect(`/admin/redaction-news/${postNews._id}`);
        } catch (err) {
            console.error('Ошибка:', err);
            res.status(500).json({ error: err.message });
            next(err);
        }
    };

    static redactionNews = async (req, res, next) => {
        try {
            const {news_id} = req.params;
            const user = req.user;
            let locale = req.cookies['locale'] || 'en';

            const currentDate = new Date();

            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const day = currentDate.getDate().toString().padStart(2, '0');

            const dateOnly = `${day}.${month}.${year}`;

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }
            const {updateTitle, title0, content0, title1, content1, title2, content2, title3, content3, title4, content4} = req.body;
            const {updatesTag, aboutGameTag, bugsErrorsTag} = req.body;

            const updateFields = {};

            const getData = await UsersModel.findById(user.id);

            if (updateTitle) updateFields.updateTitle = updateTitle;
            if (updateTitle) updateFields.fullDate = new Date;
            if (updateTitle) updateFields.date = dateOnly;
            if (updateTitle) updateFields.author = {
                authorName: getData.name,
                authorId: getData.id
            };

            if (!updateFields["tags"]) {
                updateFields["tags"] = [];
            }

            if (updatesTag) updateFields["tags"].push({ tagName: 'Updates' });
            if (aboutGameTag) updateFields["tags"].push({ tagName: 'AboutGame' });
            if (bugsErrorsTag) updateFields["tags"].push({ tagName: 'BugsErrors' });

            async function updateFilesProcess(title, content, imageKey, index) {
                if (title) {
                    if (req.files && req.files[imageKey]) {
                        const imageFile = req.files[imageKey];

                        const fileExt = path.extname(imageFile.name);
                        const safeFileName = `${uuidv4()}${fileExt}`;
                        const imagePath = `/uploads/${safeFileName}`;

                        const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
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

                        updateFields[`update.${index}`] = {
                            title,
                            content,
                            image: imagePath
                        };
                    }
                    else {
                        updateFields[`update.${index}`] = {
                            title,
                            content,
                        };
                    }
                }
            }

            updateFilesProcess(title0, content0, 'image0', 0);
            updateFilesProcess(title1, content1, 'image1', 1);
            updateFilesProcess(title2, content2, 'image2', 2);
            updateFilesProcess(title3, content3, 'image3', 3);
            updateFilesProcess(title4, content4, 'image4', 4);

            console.log('news_id', news_id);

            await NewsModel.findOneAndUpdate(
                { _id: news_id },
                { $set: updateFields },
                { new: true }
            )

            return res.redirect(`/admin/redaction-news/${news_id}`);
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

            await NewsModel.findByIdAndDelete(news_id)

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

            return res.redirect('/admin/admin-panel');
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

}

module.exports = PostController;