import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import { UsersModel } from "../models/UsersModel";

interface JwtPayload {
    id: string;
    name: string;
    role: string;
}

interface CustomRequest extends Request{
    user?: JwtPayload;
}

export const authenticateJWT = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const JWTSecret = process.env.JWTSecret!;
        const refreshTokenSecret = process.env.refreshTokenSecret!;

        let token = req.cookies.token;
        let refreshToken = req.cookies.refreshToken;

        if (!token && !refreshToken) {
            return res.redirect('/auth/login');
        }

        const locale = req.cookies['locale'] ?? 'en';

        const errorPageLocale = locale === 'en' ? 'en/error' : 'ru/error';
        const errorMsg = locale === "en" ? "Invalid token." : "Недействительный токен.";

        const verifyToken = (token: string, secretKey: string) => {
            return new Promise<JwtPayload>((resolve, reject) => {
                jwt.verify(token, secretKey, (err, decoded) => {
                    if (err) return reject(err);
                    resolve(decoded as JwtPayload);
                });
            });
        }

        const authHeader = req.headers.authorization;
        if (!token && authHeader && authHeader?.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        if (token) {
            try {
                const user = await verifyToken(token, JWTSecret);
                req.user = user;
                return next();
            } catch {
                console.log('Проблемы с Access токеном.');
            }
        }

        if (!refreshToken) {
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            return res.render(errorPageLocale, { code: '403', message: errorMsg });
        }

        try {
            const decoded  = await verifyToken(refreshToken, refreshTokenSecret);

            const user = await UsersModel.findById(decoded.id);

            const payload = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWTSecret, {
                expiresIn: "15m"
            });

            res.cookie("token", payload, {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 60 * 1000,
            });

            req.user = {
                id: user._id.toString(),
                name: user.name,
                role: user.role
            };
            return next();
        } catch (error) {
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            return res.render(errorPageLocale, { code: '403', message: errorMsg });
        }
    } catch (error) {
        next(error);
    }
};