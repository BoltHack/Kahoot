const Joi = require('@hapi/joi');
const { UsersModel } = require("../models/UsersModel");
const bcrypt = require('bcrypt');

const validateRegister = async (req, res, next) => {
    try {
        const { email } = req.body;

        let locale = req.cookies['locale'] || 'en';

        if (!req.cookies['locale']) {
            res.cookie('locale', locale, { httpOnly: true });
        }

        const existingUser = await UsersModel.findOne({ email });

        if (locale === 'en') {
            if (existingUser) {
                return res.status(400).json({ error: 'Email address is already registered.' });
            }

            let Schema = Joi.object({
                name: Joi.string().min(3).max(20).required().pattern(new RegExp('^[^~!@#$%^&*()+{}|?<>!"№;%:?*()]*$')).message('Name contains forbidden characters.'),
                email: Joi.string().min(5).max(50).required().pattern(new RegExp('^[^~!#$%^&*()+{}|?<>!"№;%:?*()]*$')).message('Email address contains forbidden characters.').email(),
                password: Joi.string().min(6).max(50).required(),
                confirmPassword: Joi.string().valid(Joi.ref('password')).required()
            }).messages({
                'any.required': 'Please fill in all input fields.',
                'string.empty': 'Please provide your name.',
                'string.email': 'Please enter a valid email address.',
                'any.only': 'Passwords do not match.',
                'string.min': 'Password must be at least 6 characters long.',
                'string.pattern.base': 'Field contains forbidden characters.'
            });
            let { error } = Schema.validate(req.body);
            console.log('validation error', error);
            if (error) {
                return res.json({ error: error.message });
            }
            next();
        } else {
            if (existingUser) {
                return res.status(400).json({ error: 'Адрес электронной почты уже зарегистрирован.' });
            }

            let Schema = Joi.object({
                name: Joi.string().min(3).max(20).required().pattern(new RegExp('^[^~!@#$%^&*()+{}|?<>!"№;%:?*()]*$')).message('Имя содержит запрещенные символы.'),
                email: Joi.string().min(5).max(50).required().pattern(new RegExp('^[^~!#$%^&*()+{}|?<>!"№;%:?*()]*$')).message('Адрес содержит запрещенные символы.').email(),
                password: Joi.string().min(6).max(50).required(),
                confirmPassword: Joi.string().valid(Joi.ref('password')).required()
            }).messages({
                'any.required': 'Пожалуйста, заполните все поля ввода.',
                'string.empty': 'Пожалуйста, укажите ваше имя.',
                'string.email': 'Пожалуйста, введите корректный адрес электронной почты.',
                'any.only': 'Пароли не совпадают.',
                'string.min': 'Пароль должен содержать как минимум 6 символов.',
                'string.pattern.base': 'Поле содержит запрещенные символы.'
            });
            let { error } = Schema.validate(req.body);
            console.log('validation error', error);
            if (error) {
                return res.json({ error: error.message });
            }
            next();
        }
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
            email: Joi.string().min(5).max(50).required().email(),
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