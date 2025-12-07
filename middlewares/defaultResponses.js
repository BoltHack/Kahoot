const defaultResponses = async (req, res, next) => {

    req.responseData = {
        locale: req.cookies['locale'] || 'en',
        notifications: req.cookies['notifications'] || 'on',
        darkTheme: req.cookies['darkTheme'] || 'on',
    };

    next();
}

module.exports = { defaultResponses };