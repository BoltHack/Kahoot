const {UsersModel } = require("../models/UsersModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require('dotenv').config();

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

            if (req.cookies['token'] && req.cookies['refreshToken']){
                return res.redirect('/')
            }
            return res.render('ru/auth/register');
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

            if (req.cookies['token'] && req.cookies['refreshToken']){
                return res.redirect('/')
            }
            return res.render('ru/auth/login');
        } catch (e) {
            next(e)
        }
    }

    static loginUser = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const {ip} = req.params;
            const user = await UsersModel.findOne({ email });

            let locale = req.cookies['locale'] || 'en';

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
            res.cookie('acceptCookies', true, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });

            return res.json({ token: accessToken, refreshToken, user, locale });
        } catch (e) {
            next(e);
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