const jwt = require("jsonwebtoken");
const HttpErrors = require("http-errors");

function verifyPermissions(role) {
    return (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            throw new HttpErrors('Страница не найдена.');
        }

        jwt.verify(token, process.env.JWTSecret, (err, decoded) => {
            if (err) {
                return res.redirect(`/error?message=${encodeURIComponent("Недействительный токен.")}`);
            }

            if (!decoded.role || decoded.role !== role) {
                throw new HttpErrors('Страница не найдена.');
            }

            req.user = decoded;
            next();
        });
    };
}

module.exports = {verifyPermissions};