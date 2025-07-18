const {UsersModel } = require("../models/UsersModel");
const {ForgottenPasswordsModel } = require("../models/ForgottenPasswords");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require('dotenv').config();

const nodemailer = require('nodemailer');
function generateRandomNumber() {
    const min = 10000;
    const max = 99999;
    return Math.floor((Math.random() + Date.now() % 1) * (max - min + 1)) + min;
}

const {JWTSecret, refreshTokenSecret} = process.env;

function parseMaxAge(duration) {
    const unit = duration.slice(-1);
    const amount = parseInt(duration.slice(0, -1), 10);

    switch (unit) {
        case 's': return amount * 1000;
        case 'm': return amount * 60 * 1000;
        case 'h': return amount * 60 * 60 * 1000;
        case 'd': return amount * 24 * 60 * 60 * 1000;
        default: throw new Error('Выбраное время не найдено');
    }
}

class AuthController {
    static registerView = (req, res, next) => {
        try {
            const locale = req.cookies['locale'];
            const darkTheme = req.cookies['darkTheme'] || 'on';

            if (req.cookies['token'] && req.cookies['refreshToken']){
                return res.redirect('/')
            }
            else {
                res.set('Cache-Control', 'no-store');
                return res.render(locale === 'en' ? 'en/auth/register' : 'ru/auth/register', { locale, darkTheme });
            }
        } catch (e) {
            next(e)
        }
    }

    static registerNewUser = async (req, res, next) => {
        try {
            const {name, email, password} = req.body;
            const {ip} = req.params;

            const hashPassword = bcrypt.hashSync(password, 8)

            const newUser = await new UsersModel({
                name,
                friendName: name.toLowerCase(),
                email,
                password: hashPassword,
                confirmPassword: hashPassword,
                ip: ip,
            })

            await newUser.save();
            return res.json({href: "/auth/login", message: "Успешная регистрация!"});
        } catch (err) {
            console.error(err);
            next(err);
        }
    }


    static loginView = (req, res, next) => {
        try {
            const locale = req.cookies['locale'];
            const darkTheme = req.cookies['darkTheme'] || 'on';

            if (req.cookies['token'] && req.cookies['refreshToken']){
                return res.redirect('/')
            }
            else {
                res.set('Cache-Control', 'no-store');
                return res.render(locale === 'en' ? 'en/auth/login' : 'ru/auth/login', { locale, darkTheme });
            }
        } catch (e) {
            next(e)
        }
    }

    static loginUser = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const {ip} = req.params;
            const user = await UsersModel.findOne({ email });
            const userId = await UsersModel.findById(user._id);

            let locale = req.cookies['locale'] || 'en';
            let previousPage = req.cookies['previousPage'] || '/';

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
            }

            if (!user) {
                return res.status(401).json({ error: "Неверный адрес или пароль." });
            }

            const pass = await bcrypt.compare(password, user.password);

            if (!pass) {
                return res.status(401).json({ error: "Неверный адрес или пароль." });
            }

            const payload = {
                id: user._id,
                email: user.email,
                name: user.name,
                registerDate: user.registerDate,
                role: user.role,
                ip: user.ip
            };

            const accessToken = jwt.sign(payload, JWTSecret, { expiresIn: '15m' });
            const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: '10d' });

            user.refreshToken = refreshToken;
            await user.save();

            const id = user._id;

            await UsersModel.findByIdAndUpdate(
                id,
                { $set: { ip: ip } },
                { new: true }
            );

            res.cookie('token', accessToken, { httpOnly: true, secure: true, maxAge: parseMaxAge('15m') });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: parseMaxAge('10d') });
            res.cookie('acceptCookies', 'true', { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });

            !req.cookies['notifications'] ? res.cookie('notifications', userId.settings.notifications, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 }) : '';
            !req.cookies['soundTrack'] ? res.cookie('soundTrack', userId.settings.soundTrack, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 }) : '';
            !req.cookies['mainEffects'] ? res.cookie('mainEffects', userId.settings.mainEffects, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 }) : '';
            !req.cookies['darkTheme'] ? res.cookie('darkTheme', userId.settings.darkTheme, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 }) : '';

            return res.json({ token: accessToken, refreshToken, user, locale, previousPage });
        } catch (e) {
            console.log(e);
            next(e);
        }
    }


    static changePassword = async (req, res, next) => {
        try {
            const { id } = req.user;
            const { oldPassword, password, confirmPassword } = req.body;

            let locale = req.cookies['locale'] || 'en';

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true });
            }

            const user = await UsersModel.findById(id);

            const pass = await bcrypt.compare(oldPassword, user.password);

            if (!pass) {
                const errorMsg = locale === 'en' ? 'The old password is incorrect.' : 'Неверный старый пароль.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            if (!password || !confirmPassword) {
                const errorMsg = locale === 'en' ? 'Password and password confirmation are required.\n' : 'Пароль и подтверджение пароля обязательны.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            if (password !== confirmPassword) {
                const errorMsg = locale === 'en' ? 'The passwords do not match.' : 'Пароли не совпадают.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            if (password.length < 6 || password.length > 50) {
                const errorMsg = locale === 'en' ? 'The password must contain a minimum of 6 characters and a maximum of 50 characters.\n' : 'Пароль должен содержать минимум 6 символов и максимум 50 символов.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const updatePassword = await UsersModel.findByIdAndUpdate(
                id,
                { password: hashedPassword },
                { new: true }
            );

            if (!updatePassword) {
                const errorMsg = locale === 'en' ? 'User not found.' : 'Пользователь не найден.';
                return res.redirect(`/error?message=${encodeURIComponent(errorMsg)}`);
            }

            res.redirect('/');
        } catch (e) {
            console.log(e);
            next(e);
        }
    }

    static sessionExpiredView = async (req, res, next) => {
        try{
            let locale = req.cookies['locale'] || 'en';
            const darkTheme = req.cookies['darkTheme'] || 'on';

            const token = req.cookies['token'];
            const refreshToken = req.cookies['refreshToken'];

            if (token || refreshToken){
                return res.redirect('/');
            }
            else {
                res.set('Cache-Control', 'no-store');
                return res.render(locale === 'en' ? 'en/auth/sessionExpired' : 'ru/auth/sessionExpired', { locale, darkTheme });
            }
        }catch (err){
            next(err)
        }
    };


    static forgetPasswordView = async (req, res, next) => {
        try {
            let locale = req.cookies['locale'] || 'en';
            const darkTheme = req.cookies['darkTheme'] || 'on';

            if (req.cookies['token'] && req.cookies['refreshToken']){
                return res.redirect('/')
            }
            else {
                res.set('Cache-Control', 'no-store');
                return res.render(locale === 'en' ? 'en/auth/forget-password' : 'ru/auth/forget-password', { darkTheme });
            }
        } catch (e) {
            next(e)
        }
    }

    static sendEmail = async (req, res, next) => {
        try {
            const {email} = req.body;
            const {ip} = req.params;

            const checkEmail = await UsersModel.findOne({email});
            const checkIp = await ForgottenPasswordsModel.findOne({ip});

            const randomNumber = generateRandomNumber().toString();

            let locale = req.cookies['locale'] || 'en';

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            if (!email) {
                const errorMsg = locale === 'en' ? 'Please fill in all input fields.' : 'Пожалуйста, заполните все поля ввода.';
                return res.status(400).json({ error: errorMsg });
            }

            if (!checkEmail){
                const errorMsg = locale === 'en' ? 'The entered address was not found.' : 'Введённый адрес не найден.';
                return res.status(400).json({ error: errorMsg });
            }

            if (checkIp && checkIp.ip === ip){
                const errorMsg = locale === 'en' ? 'You have already sent a verification code. Please try again later.' : 'Вы уже отправили код подтверждения. Повтроите попытку позже.';
                return res.status(400).json({ error: errorMsg });
            }
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS
                }
            })

            const mainOptions = {
                from: process.env.USER,
                to: email,
                subject: locale === 'en' ? 'Your HFFreelancers Account: Access from a New Browser.' : 'Ваш аккаунт HFFreelancers: Доступ из нового браузера',
                text: locale === 'en' ? `It looks like you're trying to sign in from a new device. You'll need a verification code to do this: ${randomNumber}` : `Похоже, вы пытаетесь войти в аккаунт с нового устройства. Для этого вам понадобится код подтверждения: ${randomNumber}`
            }

            transporter.sendMail(mainOptions, (error, info) => {
                if (error) {
                    return console.log('Ошибка при отправке письма:', error);
                }
                console.log('Письмо отправлено:', info.response);
                const emailCode = new ForgottenPasswordsModel({
                    email: email,
                    code: randomNumber,
                    ip: ip,
                    expiresInMinutes: '10'
                })
                emailCode.save();
                res.cookie('email', email, { httpOnly: true, maxAge: 600000 })

                return res.status(200).json('Адрес найден!');
            });

        }catch (err){
            next(err);
        }
    }

    static accountRecoveryView = async (req, res, next) => {
        try {
            let locale = req.cookies['locale'] || 'en';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            let email = req.cookies['email'];
            if (req.cookies['token'] && req.cookies['refreshToken'] && !req.cookies['email']){
                return res.redirect('/')
            }
            else {
                res.set('Cache-Control', 'no-store');
                return res.render(locale === 'en' ? 'en/auth/account-recovery' : 'ru/auth/account-recovery', { email, darkTheme });
            }
        } catch (e) {
            next(e)
        }
    }

    static accountRecovery = async (req, res, next) => {
        try {
            const {code, password, confirmPassword} = req.body
            let locale = req.cookies['locale'] || 'en';
            const email = req.cookies['email'];

            if (!code || !password || !confirmPassword) {
                const errorMsg = locale === 'en' ? 'Please fill in all input fields.' : 'Пожалуйста, заполните все поля ввода.';
                return res.status(400).json({ error: errorMsg });
            }

            const user = await ForgottenPasswordsModel.findOne({email});
            if (!user) {
                const errorMsg = locale === 'en' ? 'User not found.' : 'Пользователь не найден.';
                return res.status(400).json({ error: errorMsg });
            }

            if (user.code !== code) {
                const errorMsg = locale === 'en' ? 'Code not found.' : 'Код не найден.';
                return res.status(400).json({ error: errorMsg });
            }

            if (password !== confirmPassword) {
                const errorMsg = locale === 'en' ? 'The passwords do not match.' : 'Пароли не совпадают.';
                return res.status(400).json({ error: errorMsg });
            }

            const emailId = await UsersModel.findOne({ email });
            if (!emailId) {
                const errorMsg = locale === 'en' ? 'User not found.' : 'Пользователь не найден.';
                return res.status(400).json({ error: errorMsg });
            }

            const idS = emailId._id.toString();

            const hashedPassword = await bcrypt.hash(password, 10);

            const updatePassword = await UsersModel.findByIdAndUpdate(
                idS,
                { password: hashedPassword },
                { new: true }
            );
            res.clearCookie('email');
            updatePassword.save();
            return res.status(400).json('Пароль успешно изменён!');
        } catch (e) {
            next(e)
        }
    }


    static logout = async (req, res, next)=> {
        try {
            const id = req.user.id;
            await UsersModel.findByIdAndUpdate(id, {
                refreshToken: '',
            })
            req.cookies.user = null;
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            res.clearCookie('accessTokenEndTime');
            res.clearCookie('refreshTokenEndTime');
            return res.json({status: "Успешный выход!"});
        }catch (err){
            next(err)
        }
    }

}

module.exports = AuthController;