const {UsersModel} = require("../models/UsersModel");
const {ForgottenPasswordsModel} = require("../models/ForgottenPasswords");
const {AddressRecoveryRequestsModel} = require("../models/Address-recovery-requests");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require('express');
const router = express.Router();

require('dotenv').config();

const nodemailer = require('nodemailer');
const crypto = require("crypto");
function generateRandomNumber() {
    const min = 10000;
    const max = 99999;
    return Math.floor((Math.random() + Date.now() % 1) * (max - min + 1)) + min;
}

function generateRandomSymbols() {
    let result = '';
    let symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!№;%:?*()_+=";
    for (let i = 0; i < 200; i++) {
        result += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
    return result;
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
                res.set('Pragma', 'no-cache');
                res.set('Expires', '0');
                return res.render(locale === 'en' ? 'en/auth/register' : 'ru/auth/register', { locale, darkTheme });
            }
        } catch (err) {
            next(err)
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
                res.set('Pragma', 'no-cache');
                res.set('Expires', '0');
                return res.render(locale === 'en' ? 'en/auth/login' : 'ru/auth/login', { locale, darkTheme });
            }
        } catch (err) {
            next(err)
        }
    }

    static loginUser = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const {ip} = req.params;
            const user = await UsersModel.findOne({ email });
            const userId = await UsersModel.findById(user._id);

            const pageUrl = req.protocol + '://' + req.get('host');
            console.log('pageUrl', pageUrl);

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

            const payloadA = {
                id: user._id,
                email: user.email,
                name: user.name,
                registerDate: user.registerDate,
                role: user.role,
                ip: user.ip
            };

            const payloadR = {
                id: user._id,
                role: user.role,
                tokenVersion: user.tokenVersion
            };

            const accessToken = jwt.sign(payloadA, JWTSecret, { expiresIn: '15m' });
            const refreshToken = jwt.sign(payloadR, refreshTokenSecret, { expiresIn: '10d' });

            const hash = crypto
                .createHash('sha256')
                .update(refreshToken)
                .digest('hex');
            console.log('auth hash', hash);
            user.refreshTokenHash = hash;
            user.save();

            const id = user._id;

            await UsersModel.findByIdAndUpdate(
                id,
                { $set: { ip: ip } },
                { new: true }
            );

            res.cookie('token', accessToken, { httpOnly: true, secure: true, maxAge: parseMaxAge('15m') });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: parseMaxAge('10d') });
            res.cookie('acceptCookies', 'true', { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });

            req.cookies['notifications'] !== userId.settings.notifications ? res.cookie('notifications', userId.settings.notifications, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 }) : '';
            req.cookies['soundTrack'] !== userId.settings.soundTrack ? res.cookie('soundTrack', userId.settings.soundTrack, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 }) : '';
            req.cookies['mainEffects'] !== userId.settings.mainEffects ? res.cookie('mainEffects', userId.settings.mainEffects, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 }) : '';
            req.cookies['darkTheme'] !== userId.settings.darkTheme ? res.cookie('darkTheme', userId.settings.darkTheme, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 }) : '';

            return res.json({ token: accessToken, refreshToken, user, locale, previousPage });
        } catch (err) {
            console.log(err);
            next(err);
        }
    }


    static changePassword = async (req, res, next) => {
        try {
            const user = req.user;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            let locale = req.cookies['locale'] || 'en';

            if (!currentPassword || !newPassword || !confirmPassword) {
                const errorMsg = locale === 'en' ? 'Please fill in all input fields.' : 'Пожалуйста, заполните все поля ввода.';
                return res.status(400).json({ error: errorMsg });
            }

            const userInfo = await UsersModel.findById(user.id);

            const pass = await bcrypt.compare(currentPassword, userInfo.password);

            if (!pass) {
                const errorMsg = locale === 'en' ? 'The old password is incorrect.' : 'Неверный старый пароль.';
                return res.status(401).json({ error: errorMsg });
            }

            if (!newPassword || !confirmPassword) {
                const errorMsg = locale === 'en' ? 'Password and password confirmation are required.' : 'Пароль и подтверджение пароля обязательны.';
                return res.status(401).json({ error: errorMsg });
            }

            if (newPassword !== confirmPassword) {
                const errorMsg = locale === 'en' ? 'The passwords do not match.' : 'Пароли не совпадают.';
                return res.status(401).json({ error: errorMsg });
            }

            if (newPassword.length < 6 || newPassword.length > 50) {
                const errorMsg = locale === 'en' ? 'The password must contain a minimum of 6 characters and a maximum of 50 characters.' : 'Пароль должен содержать минимум 6 символов и максимум 50 символов.';
                return res.status(401).json({ error: errorMsg });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updatePassword = await UsersModel.findByIdAndUpdate(
                user.id,
                { password: hashedPassword },
                { new: true }
            );

            if (!updatePassword) {
                const errorMsg = locale === 'en' ? 'User not found.' : 'Пользователь не найден.';
                return res.status(401).json({ error: errorMsg });
            }

            const successMessage = locale === 'en' ? 'Password successfully changed!' : 'Пароль успешно изменён!';
            return res.status(200).json({ message: successMessage });
        } catch (err) {
            console.log(err);
            next(err);
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
        } catch (err) {
            next(err)
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

        } catch (err){
            next(err);
        }
    }

    static accountRecoveryView = async (req, res, next) => {
        try {
            let locale = req.cookies['locale'] || 'en';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            let email = req.cookies['email'];

            if (req.cookies['token'] || req.cookies['refreshToken'] || !email){
                return res.redirect('/')
            }
            else {
                res.set('Cache-Control', 'no-store');
                return res.render(locale === 'en' ? 'en/auth/account-recovery' : 'ru/auth/account-recovery', { email, darkTheme });
            }
        } catch (err) {
            next(err)
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
        } catch (err) {
            next(err)
        }
    }

    static accountDelete = async (req, res, next) => {
        try {
            const {deleteInput} = req.body;

            const user = req.user;
            const userInfo = await UsersModel.findById(user.id);
            const locale = req.cookies['locale'] || 'en';

            if (!userInfo || !userInfo.password) {
                console.log('Пользователь не найден.');
            }

            if (deleteInput.length < 1) {
                const errorMsg = locale === 'en' ? 'Password is required.' : 'Введите пароль.';
                return res.status(400).json({ error: errorMsg });
            }

            const pass = await bcrypt.compare(deleteInput, userInfo.password);

            if (!pass) {
                const errorMsg = locale === 'en' ? 'Wrong password.' : 'Неверный пароль.';
                return res.status(401).json({ error: errorMsg });
            }

            const deletionDate = new Date(Date.now() + 30*24*60*60*1000);
            await UsersModel.findByIdAndUpdate(
                { _id: user.id },
                {
                    $set: {
                        expiresAt: deletionDate
                    }
                },
                { new: true }
            )
            return res.status(200).json({ message: 'Аккаунт успешно переводен на стадию удаления!' });
        } catch (e) {
            next(e);
        }
    }

    static accountDeletionProcess = async (req, res, next) => {
        try {
            const user = req.user;
            const userInfo = await UsersModel.findById(user.id);
            const locale = req.cookies['locale'] || 'en';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            const sendCode = req.cookies['sendCode'] || false;

            if (userInfo.expiresAt) {
                res.set('Cache-Control', 'no-store');
                res.set('Pragma', 'no-cache');
                res.set('Expires', '0');
                return res.render(locale === 'en' ? 'en/auth/account-deletion-process' : 'ru/auth/account-deletion-process', { user, userInfo, darkTheme, sendCode, locale });
            } else {
                return res.redirect('/');
            }
        } catch (e) {
            next(e);
        }
    }

    static accountRestore = async (req, res, next) => {
        try {
            const user = req.user;
            const userInfo = await UsersModel.findById(user.id);
            if (!userInfo.expiresAt) {
                return res.redirect('/');
            }

            const locale = req.cookies['locale'] || 'en';
            const code = generateRandomSymbols().toString();
            const recoverUrl = req.protocol + '://' + req.get('host') + '/auth/account-recover/' + encodeURIComponent(code);

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS
                }
            })

            const mainOptions = {
                from: process.env.USER,
                to: user.email,
                subject: locale === 'en'
                    ? 'Your HFFreelancers Account: Account Recovery'
                    : 'Ваш аккаунт HFFreelancers: Восстановление аккаунта',
                html: locale === 'en'
                    ? `
            <p>
                It looks like you're trying to restore your account.
                <a href="${recoverUrl}" target="_blank" rel="noopener noreferrer">
                    Click here to restore your account
                </a>
            </p>
            <p>This link is valid for 10 minutes.</p>
        `
                    : `
            <p>
                Похоже, вы пытаетесь восстановить ваш аккаунт.
                <a href="${recoverUrl}" target="_blank" rel="noopener noreferrer">
                    Перейдите по ссылке для восстановления аккаунта
                </a>
            </p>
            <p>Ссылка действительна 10 минут.</p>
        `
            };


            transporter.sendMail(mainOptions, async (error, info) => {
                if (error) {
                    const errorMsg = locale === 'en' ? 'Error sending email.' : 'Ошибка при отправке письма.';
                    res.status(401).json({ error: errorMsg });
                    return console.log('Ошибка при отправке письма:', error);
                }
                console.log('Письмо отправлено:', info.response);

                const codes = await AddressRecoveryRequestsModel.find({ id: userInfo.id });
                const idS = codes.map(code => code._id)

                await AddressRecoveryRequestsModel.deleteMany(
                    { _id: { $in: idS } }
                )

                const sendCode = new AddressRecoveryRequestsModel({
                    id: user.id,
                    email: user.email,
                    code: code,
                    ip: user.ip,
                    expiresInMinutes: 10
                })
                await sendCode.save();
                res.cookie('sendCode', true, {maxAge: 10 * 60 * 1000});

                return res.status(200).json({ message: 'Письмо отправлено!' })
            });
        } catch (e) {
            next(e);
        }
    }

    static accountRecover = async (req, res, next) => {
        try {
            const {code} = req.params;
            console.log('code', code);

            const locale = req.cookies['locale'] || 'en';
            const userInfo = await AddressRecoveryRequestsModel.findOne({ code: code });

            if (userInfo) {
                console.log('userInfo', userInfo.email);
                await UsersModel.findByIdAndUpdate(
                    userInfo.id,
                    {
                        $unset: { expiresAt: "" }
                    }
                )

                await AddressRecoveryRequestsModel.deleteOne({ code });
                res.clearCookie('sendCode');
                return res.redirect('/');
            } else {
                const errorMsg = locale === 'en' ? 'This link is no longer valid.' : 'Эта ссылка уже недействительна.';
                return res.redirect(`/error?code=409&message=${encodeURIComponent(errorMsg)}`);
            }

            return res.render(locale === 'en' ? 'en/auth/account-recover' : 'ru/auth/account-recover');
        } catch (e) {
            next(e);
        }
    }


    static logout = async (req, res, next) => {
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