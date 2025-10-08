function errorHandler(err, req, res, next) {
    console.error('err', err);

    let locale = req.cookies['locale'] || 'en';

    const message = req.query.message || err.message;
    const code = req.query.code || '404';

    res.status(err.status || 500).render(locale === 'en' ? 'en/error' : 'ru/error', { code , message });
}

module.exports = errorHandler;