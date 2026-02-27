import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

function parseMaxAge(duration: string): number {
    const unit = duration.slice(-1);
    const amount = parseInt(duration.slice(0, -1), 10);

    switch (unit) {
        case 's': return amount * 1000;
        case 'm': return amount * 60 * 1000;
        case 'h': return amount * 60 * 60 * 1000;
        case 'd': return amount * 24 * 60 * 60 * 1000;
        default: throw new Error('Выбраное время не найдено');
    }
}

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

        const locale = req.cookies['locale'] ?? 'en';
        const errorPageLocale = locale === 'en' ? 'en/error' : 'ru/error';

        const verifyToken = (token: string, secretKey: string) => {
            return new Promise<JwtPayload>((resolve, reject) => {
                jwt.verify(token, secretKey, (err, decoded) => {
                    if (err) return reject(err);
                    resolve(decoded as JwtPayload);
                });
            });
        }

        let token = req.cookies.token;
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
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.redirect("/auth/login");
        }

        try {
            const user = await verifyToken(refreshToken, refreshTokenSecret!);

            const newAccessToken = jwt.sign(user, JWTSecret, {
                expiresIn: "15m"
            });

            res.cookie("token", newAccessToken, {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 60 * 1000,
            });

            req.user = user;
            return next();
        } catch (error) {
            const errorMsg = locale === "en" ? "Invalid refresh token." : "Недействительный refresh-токен.";
            return res.render(errorPageLocale, { code: '403', message: errorMsg })
        }

    } catch (error) {
        next(error);
    }
};