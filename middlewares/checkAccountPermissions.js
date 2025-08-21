const {authenticateJWT} = require("./jwtAuth");
const {UsersModel} = require("../models/UsersModel");
const checkAccountPermissions = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return next();
        }

        authenticateJWT(req, res, async (err) => {
            if (err) {
                console.error("JWT auth error:", err);
                return next();
            }

            if (!req.user || !req.user.id) {
                return next();
            }

            const userInfo = await UsersModel.findById(req.user.id).lean();

            if (userInfo && userInfo.expiresAt) {
                if (req.originalUrl !== "/auth/account-deletion-process") {
                    console.log('name:', userInfo.name);
                    return res.redirect("/auth/account-deletion-process");
                }
            }
            next();
        });
    } catch (e) {
        next(e);
    }
}

module.exports = { checkAccountPermissions };