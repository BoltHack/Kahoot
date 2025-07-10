const jwt = require("jsonwebtoken");
const { UsersModel } = require("../models/UsersModel");
const { JWTSecret, refreshTokenSecret } = process.env;

async function accessToken(req, res, next) {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.sendStatus(401);
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, refreshTokenSecret);
        } catch (err) {
            console.log(err);
            return res.sendStatus(403);
        }

        const user = await UsersModel.findById(decoded.id);
        if (!user) {
            return res.sendStatus(403);
        }

        const newAccessToken = jwt.sign({
            id: user._id,
            email: user.email,
            name: user.name,
            registerDate: user.registerDate,
            role: user.role,
            ip: user.ip,
        }, JWTSecret, { expiresIn: '15m' });

        res.cookie('token', newAccessToken, { httpOnly: true, secure: true, maxAge: 15 * 60 * 1000 });

        return res.json({ token: newAccessToken });
    } catch (err) {
        next(err);
    }
}

module.exports = { accessToken };
