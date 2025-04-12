const jwt = require("jsonwebtoken");
const HttpErrors = require("http-errors");
const {UsersModel} = require("../models/UsersModel");
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
const authenticateJWT = async (req, res, next) => {
    const token = req.cookies.token;

    let locale = req.cookies['locale'] || 'en';

    if (!req.cookies['locale']) {
        res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
    }

    if (token) {
        jwt.verify(token, JWTSecret, (err, user) => {
            if (err) {
                const errorMsg = locale === 'en' ? 'Invalid access token.' : 'Недействительный токен доступа.';
                throw new HttpErrors(errorMsg, 403);
            }
            req.user = user;
            next();
        });
    }
    else {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            jwt.verify(refreshToken, refreshTokenSecret, async (err, user) => {
                if (err) {
                    const errorMsg = locale === 'en' ? 'Invalid access token.' : 'Недействительный токен доступа.';
                    throw new HttpErrors(errorMsg, 403);
                }
                req.user = user;
                console.log('user', user);

                const payload = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    registerDate: user.registerDate,
                    role: user.role,
                    ip: user.ip
                };

                console.log('payload', payload);
                const accessToken = jwt.sign(payload, JWTSecret, { expiresIn: '15m' });
                res.cookie('token', accessToken, { httpOnly: true, secure: true, maxAge: parseMaxAge('15m') });
                next();
            });
        }
        else {
            res.redirect('/auth/login');
        }
    }
};

module.exports = {authenticateJWT};