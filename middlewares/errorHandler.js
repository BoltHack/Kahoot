function errorHandler(err, req, res, next) {
    console.error('err', err);
    res.status(err.status || 500).render('error', {
        message: 'Произошла ошибка. Пожалуйста, попробуйте позже.'
    });
}

module.exports = errorHandler;