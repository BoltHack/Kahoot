const {UsersModel} = require("../models/UsersModel");

const checkEmail = async (req, res, next) => {
    try {
        const {email} = req.body;
        const user = await UsersModel.findOne({email: email});
        if (user) {
            return res.json({error: `Адрес ${user.email} уже зарегистрирован.`})
        }
        next()
    } catch (e) {
        next(e);
        return res.json({
            error: e.message
        })
    }
}

module.exports = {checkEmail};