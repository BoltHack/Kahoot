const jwt = require("jsonwebtoken");
const HttpErrors = require("http-errors");
const {JWTSecret} = process.env;
const authenticateJWT = async (req, res, next) => {
    const token = req.cookies.token;

    let locale = req.cookies['locale'] || 'en';

    if (!req.cookies['locale']) {
        res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
    }

    if (token) {
        jwt.verify(token, JWTSecret, (err, user) => {
            if (err) {
                // return res.sendStatus(403);
                const errorMsg = locale === 'en' ? 'Invalid access token.' : 'Недействительный токен доступа.';
                throw new HttpErrors(errorMsg, 403);
            }
            req.user = user;
            next();
        });
    }
    else {
        res.redirect('/auth/login');
    }
};

module.exports = {authenticateJWT}