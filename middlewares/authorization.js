const jwt = require('jsonwebtoken');

const { JWTSecret } = process.env;

const verifyToken = (req, res, next) => {
    console.log('auth', req.headers['authorization']);
    if (req.headers['authorization']) {
        try {
            const token = req.headers['authorization'].split(' ')[1];
            jwt.verify(token, JWTSecret, (err, decoded) => {
                if (err) {
                    return res.redirect(`/error?message=${encodeURIComponent("Не удалось аутентифицировать токен.")}`);
                }
                req.user = decoded;

                next();
            });
        } catch (e) {
            next(e)
            return res.redirect(`/error?message=${encodeURIComponent("Неверный токен.")}`);
        }
    } else {
        return res.redirect(`/error?message=${encodeURIComponent("Токен не предоставлен.")}`);
    }
};

module.exports = { verifyToken };