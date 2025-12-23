const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { UsersModel } = require("../models/UsersModel");
const { JWTSecret, refreshTokenSecret } = process.env;

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

async function refreshToken(req, res, next) {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.sendStatus(401);
        }

        jwt.verify(refreshToken, refreshTokenSecret, async (err, decoded) => {
            if (err) {
                console.log(err)
                return res.sendStatus(403);
            }

            const user = await UsersModel.findById(decoded.id);
            if (!user) {
                return res.sendStatus(403);
            }

            const pastHash = crypto
                .createHash('sha256')
                .update(refreshToken)
                .digest('hex');
            console.log('pastHash', pastHash)
            if (pastHash !== user.refreshTokenHash) {
                console.log('pastHash', pastHash)
                console.log('refreshTokenHash', user.refreshTokenHash);
                console.log('token hash error');
                return res.sendStatus(403);
            }
            if (decoded.tokenVersion !== user.tokenVersion) {
                console.log('token version', user.tokenVersion);
                console.log('token version error');
                return res.sendStatus(403);
            }

            const newRefreshToken = jwt.sign({
                id: user._id,
                role: user.role,
                tokenVersion: user.tokenVersion
            }, refreshTokenSecret, { expiresIn: '10d' });

            const hash = crypto
                .createHash('sha256')
                .update(newRefreshToken)
                .digest('hex');
            user.refreshTokenHash = hash;
            console.log('update hash', hash);
            console.log('newRefreshToken', newRefreshToken);
            user.tokenVersion = decoded.tokenVersion;
            await user.save();

            const newAccessToken = jwt.sign({
                id: user._id,
                email: user.email,
                name: user.name,
                registerDate: user.registerDate,
                role: user.role,
                ip: user.ip
            }, JWTSecret, { expiresIn: '15m' });

            await res.cookie('token', newAccessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: parseMaxAge('15m') });
            await res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: parseMaxAge('10d') });

            return res.json({ token: newAccessToken, newRefreshToken });
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { refreshToken };