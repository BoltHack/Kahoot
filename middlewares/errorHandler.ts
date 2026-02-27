import {Request, Response, NextFunction} from "express";

export function errorHandler (err: any, req: Request, res: Response, next: NextFunction) {
    console.error('err', err);

    let locale = req.cookies?.['locale'] || 'en';

    const message = req.query.message || err.message;
    const code = req.query.code || '404';

    res.status(err.status || 500).render(locale === 'en' ? 'en/error' : 'ru/error', { code , message });
}

// module.exports = errorHandler;