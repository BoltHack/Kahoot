const {authenticateJWT} = require("./jwtAuth");
const {UsersModel} = require("../models/UsersModel");
const checkAccountPermissions = async (req, res, next) => {
    try {
        if (req.cookies['refreshToken']) {
            await authenticateJWT(req, res, async () => {
                const user = req.user;
                const userInfo = await UsersModel.findById(user.id);

                if (userInfo.expiresAt) {
                    return res.redirect('/auth/account-deletion-process');
                }
                next();
            });
        } else next();
    } catch (e) {
        next(e);
    }
}

module.exports = { checkAccountPermissions };