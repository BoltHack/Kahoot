const jwt = require("jsonwebtoken");
const HttpErrors = require("http-errors");

function verifyPermissions(role) {
    return (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            // return res.redirect(`/error?message=${encodeURIComponent("Требуется аутентификация.")}`);
            throw new HttpErrors('Not Found');
        }

        jwt.verify(token, process.env.JWTSecret, (err, decoded) => {
            if (err) {
                return res.redirect(`/error?message=${encodeURIComponent("Недействительный токен.")}`);
            }

            if (!decoded.role || decoded.role !== role) {
                // return res.redirect(`/error?message=${encodeURIComponent("У вас нет доступа к этому ресурсу.")}`);
                throw new HttpErrors('Not Found');
            }

            req.user = decoded;
            next();
        });
    };
}

module.exports = {verifyPermissions};