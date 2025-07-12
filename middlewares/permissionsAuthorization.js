const jwt = require("jsonwebtoken");
const HttpErrors = require("http-errors");

function verifyPermissions(role) {
    return (req, res, next) => {
        const token = req.cookies.token;

        let locale = req.cookies['locale'] || 'en';

        if (!req.cookies['locale']) {
            res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
        }

        if (!token) {
            const errorMsg = locale === 'en' ? 'Not Found' : 'Страница не найдена.';
            throw new HttpErrors(errorMsg, 404);
        }

        jwt.verify(token, process.env.JWTSecret, (err, decoded) => {
            if (err) {
                return res.redirect(`/error?message=${encodeURIComponent("Недействительный токен.")}`);
            }

            if (!decoded.role || decoded.role !== role) {
                const errorMsg = locale === 'en' ? 'Not Found' : 'Страница не найдена.';
                throw new HttpErrors(errorMsg, 404);
            }

            req.user = decoded;
            next();
        });
    };
}

module.exports = {verifyPermissions};