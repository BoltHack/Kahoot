const appData = async (req, res, next) => {

    req.basicData = {
        locale: req.cookies['locale'] || 'en',
        notifications: req.cookies['notifications'] || 'on',
        darkTheme: req.cookies['darkTheme'] || 'on',
    };

    next();
}

module.exports = { appData };