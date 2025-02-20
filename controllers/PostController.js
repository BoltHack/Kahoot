const {GamesModel} = require('../models/GamesModel')
const {UsersModel} = require("../models/UsersModel");

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
                game_language: 'En',
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
            })
            await newGame.save();

            // if (!userId.myGames.some(fav => fav.gameId === newGame._id)) {
            userId.myGames.push({gameId: newGame._id});
            await userId.save();
            // }

            return res.redirect(`/redaction/${newGame._id}`);
        }catch (err){
            next(err);
        }
    }

    static redaction = async (req, res, next) => {
        try {
            const { game_id } = req.params;
            const { game_name, game_access, max_online, game_language, game_expiresInSeconds, game_max_questions,
                question_title0, question_title1, question_title2, question_title3, question_title4,
                question_title0_question_1, question_title0_question_2, question_title0_question_3, question_title0_question_4, question_title0_correct_question,
                question_title1_question_1, question_title1_question_2, question_title1_question_3, question_title1_question_4, question_title1_correct_question,
                question_title2_question_1, question_title2_question_2, question_title2_question_3, question_title2_question_4, question_title2_correct_question,
                question_title3_question_1, question_title3_question_2, question_title3_question_3, question_title3_question_4, question_title3_correct_question,
                question_title4_question_1, question_title4_question_2, question_title4_question_3, question_title4_question_4, question_title4_correct_question
            } = req.body;

            const updateFields = {};

            if (game_name) updateFields.game_name = game_name;
            if (game_access) updateFields.game_access = game_access;
            if (game_access) updateFields.expiresInMinutes = 60;
            if (max_online) updateFields["game_online.max_online"] = max_online;
            if (game_language) updateFields.game_language = game_language;
            if (game_expiresInSeconds) updateFields.game_expiresInSeconds = game_expiresInSeconds;
            if (game_max_questions) updateFields.game_max_questions = game_max_questions;

            if (question_title0) {
                let base64Image = default_question_image;
                if (req.files && req.files.question_image0) {
                    const imageFile = req.files.question_image0;
                    base64Image = imageFile.data.toString('base64');
                }
                updateFields["game_questions.0"] = {
                    question_title: question_title0,
                    question_image: base64Image,
                    question_1: {
                        title: question_title0_question_1,
                    },
                    question_2: {
                        title: question_title0_question_2,
                    },
                    question_3: {
                        title: question_title0_question_3,
                    },
                    question_4: {
                        title: question_title0_question_4,
                    },
                    correct_question: question_title0_correct_question,
                    question_number: 0
                };
            }
            if (question_title1) {
                let base64Image = default_question_image;
                if (req.files && req.files.question_image1) {
                    const imageFile = req.files.question_image1;
                    base64Image = imageFile.data.toString('base64');
                }
                updateFields["game_questions.1"] = {
                    question_title: question_title1,
                    question_image: base64Image,
                    question_1: {
                        title: question_title1_question_1,
                    },
                    question_2: {
                        title: question_title1_question_2,
                    },
                    question_3: {
                        title: question_title1_question_3,
                    },
                    question_4: {
                        title: question_title1_question_4,
                    },
                    correct_question: question_title1_correct_question,
                    question_number: 1
                };
            }
            if (question_title2) {
                let base64Image = default_question_image;
                if (req.files && req.files.question_image2) {
                    const imageFile = req.files.question_image2;
                    base64Image = imageFile.data.toString('base64');
                }
                updateFields["game_questions.2"] = {
                    question_title: question_title2,
                    question_image: base64Image,
                    question_1: {
                        title: question_title2_question_1,
                    },
                    question_2: {
                        title: question_title2_question_2,
                    },
                    question_3: {
                        title: question_title2_question_3,
                    },
                    question_4: {
                        title: question_title2_question_4,
                    },
                    correct_question: question_title2_correct_question,
                    question_number: 2
                };
            }
            if (question_title3) {
                let base64Image = default_question_image;
                if (req.files && req.files.question_image3) {
                    const imageFile = req.files.question_image3;
                    base64Image = imageFile.data.toString('base64');
                }
                updateFields["game_questions.3"] = {
                    question_title: question_title3,
                    question_image: base64Image,
                    question_1: {
                        title: question_title3_question_1,
                    },
                    question_2: {
                        title: question_title3_question_2,
                    },
                    question_3: {
                        title: question_title3_question_3,
                    },
                    question_4: {
                        title: question_title3_question_4,
                    },
                    correct_question: question_title3_correct_question,
                    question_number: 3
                };
            }
            if (question_title4) {
                let base64Image = default_question_image;
                if (req.files && req.files.question_image4) {
                    const imageFile = req.files.question_image4;
                    base64Image = imageFile.data.toString('base64');
                }
                updateFields["game_questions.4"] = {
                    question_title: question_title4,
                    question_image: base64Image,
                    question_1: {
                        title: question_title4_question_1,
                    },
                    question_2: {
                        title: question_title4_question_2,
                    },
                    question_3: {
                        title: question_title4_question_3,
                    },
                    question_4: {
                        title: question_title4_question_4,
                    },
                    correct_question: question_title4_correct_question,
                    question_number: 4
                };
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
            next(err);
        }
    };

    static deleteGame = async (req, res, next) => {
        try {
            const { game_id } = req.params;
            await GamesModel.findByIdAndDelete(game_id);
            return res.redirect('/my-games');
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
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
        }catch(error){
            console.error(error);
            return res.status(500).json({ error: error.message });
        }
    }

    static gameUsers = async (req, res, next) => {
        try {
            const {user_id} = req.params;
            const userGame = await UsersModel.findById(user_id);

            await UsersModel.findOneAndUpdate(
                { _id: user_id },
                {
                    $set: {
                        'game.0.game_answers': userGame.game[0].game_answers + 1
                    }
                },
                { new: true }
            )
        }catch (error){
            console.error(error);
            return res.status(500).json({ error: error.message });
        }
    }

    static gameCorrectUsers = async (req, res, next) => {
        try {
            const {user_id} = req.params;
            const userGame = await UsersModel.findById(user_id);

            await UsersModel.findOneAndUpdate(
                { _id: user_id },
                {
                    $set: {
                        'game.0.game_answers': userGame.game[0].game_answers + 1,
                        'game.0.game_correct_answers': userGame.game[0].game_correct_answers + 1,
                    },
                },
                { new: true }
            )
        }catch (error){
            console.error(error);
            return res.status(500).json({ error: error.message });
        }
    }

    static userLeader = async (req, res, next) => {
        try {
            const {game_id} = req.params;
            const user = req.user;
            const userId = await UsersModel.findById(user.id);
            console.log('answers', userId.game[0].game_answers);
            console.log('correct_answers', userId.game[0].game_correct_answers);

            await GamesModel.findOneAndUpdate(
                { _id: game_id },
                {
                    $push: {
                        game_leaders: { name: user.name, correct_answers: userId.game[0].game_correct_answers }
                    },
                },
                { new: true }
            )
        }catch (error){
            console.error(error);
            return res.status(500).json({ error: error.message });
        }
    }

    static getData = async (req, res, next) => {
        try {
            if (req.cookies['token']) {
                const {game_id} = req.params;
                const getData = await GamesModel.findById(game_id);
                const gameQuestions = getData.game_questions;
                res.json({gameQuestions});
            }
        }catch (err){
            console.error('Ошибка:', err);
            res.status(500).json({error: err.message});
            next(err);
        }
    }

}

module.exports = PostController;