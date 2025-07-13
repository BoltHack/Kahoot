const Joi = require('@hapi/joi');
const { UsersModel } = require("../models/UsersModel");
const bcrypt = require('bcrypt');

const validateRegister = async (req, res, next) => {
    try {
        const { email, name } = req.body;

        let locale = req.cookies['locale'] || 'en';

        if (!req.cookies['locale']) {
            res.cookie('locale', locale, { httpOnly: true });
        }

        const existingUser = await UsersModel.findOne({ email });
        const existingUsername = await UsersModel.findOne({ name });

        if (existingUser) {
            const errorMsg = locale === 'en' ? 'This Email address is already registered.' : 'Этот адрес электронной почты уже зарегистрирован.';
            return res.status(400).json({ error: errorMsg });
        }

        if (existingUsername) {
            const errorMsg = locale === 'en' ? 'The nickname is already taken.' : 'Никнейм уже занят.';
            return res.status(400).json({ error: errorMsg });
        }

        let Schema = Joi.object({
            name: Joi.string().min(3).max(20).required()
                .pattern(/^[A-Za-z0-9]+$/)
                .message(locale === 'en' ? 'Nickname contains forbidden characters.' : 'Никнейм содержит запрещённые символы.'),
            email: Joi.string().min(5).max(50).required()
                .pattern(/^[A-Za-z@0-9.]+$/)
                .message(locale === 'en' ? 'Email address contains forbidden characters.' : 'Адрес электронной почты содержит запрещённые символы.')
                .email(),
            password: Joi.string().min(6).max(50).required(),
            confirmPassword: Joi.string().valid(Joi.ref('password')).required()
        }).messages({
            'any.required': locale === 'en' ? 'Please fill in all input fields.' : 'Пожалуйста, заполните все поля ввода.',
            'string.empty': locale === 'en' ? 'Please provide your name.' : 'Пожалуйста, укажите ваше имя.',
            'string.email': locale === 'en' ? 'Please enter a valid email address.' : 'Пожалуйста, введите корректный адрес электронной почты.',
            'any.only': locale === 'en' ? 'Passwords do not match.' : 'Пароли не совпадают.',
            'string.min': locale === 'en' ? 'Password must be at least 6 characters long.' : 'Пароль должен содержать как минимум 6 символов.',
            'string.pattern.base': locale === 'en' ? 'Field contains forbidden characters.' : 'Поле содержит запрещенные символы.'
        });
        let { error } = Schema.validate(req.body);
        console.log('validation error', error);
        if (error) {
            return res.json({ error: error.message });
        }

        next();
    } catch (e) {
        next(e);
        return res.json({ error: e.message });
    }
}

const validateLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        let locale = req.cookies['locale'] || 'en';
        if (!req.cookies['locale']) {
            res.cookie('locale', locale, { httpOnly: true });
        }

        const existingUser = await UsersModel.findOne({ email });

        const Schema = Joi.object({
            email: Joi.string().min(5).max(50).required()
                .pattern(/^[A-Za-z@0-9.]+$/)
                .message(locale === 'en' ? 'Email address contains forbidden characters.' : 'Адрес электронной почты содержит запрещённые символы.')
                .email(),
            password: Joi.string().min(6).max(50).required(),
        }).messages({
            'any.required': locale === 'en' ? 'Please fill in all input fields.' : 'Пожалуйста, заполните все поля ввода.',
        });

        if (!existingUser) {
            const errorMsg = locale === 'en' ? 'Email address not found.' : 'Адрес электронной почты не найден.';
            return res.status(400).json({ error: errorMsg });
        }

        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            const errorMsg = locale === 'en' ? 'Incorrect email or password.' : 'Неверный адрес или пароль.';
            return res.status(401).json({ error: errorMsg });
        }

        const { error } = Schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        next();
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

module.exports = { validateRegister, validateLogin };