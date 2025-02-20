const jwt = require("jsonwebtoken");
const {JWTSecret} = process.env;
const authenticateJWT = async (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, JWTSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
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