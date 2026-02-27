import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import HttpErrors from "http-errors";

interface UserData {
    role: string;
}

interface CustomRequest extends Request {
    user?: UserData;
}

export function verifyPermissions(role: string) {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        const JWTSecret = process.env.JWTSecret!;

        const token = req.cookies.token;

        let locale = req.cookies['locale'] || 'en';
        if (!req.cookies['locale']) {
            res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
        }
        const errorPageLocale = locale === 'en' ? 'en/error' : 'ru/error';

        if (!token) {
            const errorMsg = locale === 'en' ? 'Not Found' : 'Страница не найдена.';
            return res.render(errorPageLocale, { code: '404', message: errorMsg });
        }

        let decoded: unknown;

        try {
            decoded = jwt.verify(token, JWTSecret) as UserData;
        } catch (err) {
            console.log(err)
            return res.render(errorPageLocale, { code: '404', message: '' });
        }

        if (!decoded || typeof decoded !== 'object' || !('role' in decoded)) {
            return res.render(errorPageLocale, { code: '404', message: '' });
        }

        const userData = decoded as UserData;

        if (!userData.role || userData.role !== role) {
            return res.render(errorPageLocale, { code: '404', message: '' });
        }

        req.user = userData;
        next();
    };
}

// module.exports = {verifyPermissions};