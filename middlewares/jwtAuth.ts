import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UsersModel } from "../models/UsersModel";

interface JwtPayload {
    id: string;
    name: string;
    role: string;
}

interface RefreshPayload {
    id: string;
    tokenVersion: number;
}

interface CustomRequest extends Request{
    user?: JwtPayload;
}

const verifyToken = <T>(token: string, secretKey: string): Promise<T> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded as T);
        });
    });
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

        // const authHeader = req.headers.authorization;
        // if (!token && authHeader && authHeader?.startsWith("Bearer ")) {
        //     token = authHeader.split(" ")[1];
        // }

        if (token) {
            try {
                const user = await verifyToken<JwtPayload>(token, JWTSecret);
                req.user = user;
                return next();
            } catch {
                console.log('Проблемы с Access токеном.');
            }
        }

        // if (refreshToken.tokenVersion !== req.user.tokenVersion) {
        //     res.clearCookie('token');
        //     return res.redirect('/auth/login');
        // }

        if (!refreshToken) {
            res.clearCookie('token');
            return res.redirect('/auth/login');
        }

        try {
            const decoded  = await verifyToken<RefreshPayload>(refreshToken, refreshTokenSecret);
            const user = await UsersModel.findById(decoded.id);

            const currentHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

            if (!user || user.refreshTokenHash !== currentHash || user.tokenVersion !== decoded.tokenVersion) {
                res.clearCookie('token');
                res.clearCookie('refreshToken');
                return res.status(403).json({ message: 'Session compromised' });
            }

            const payload = jwt.sign({ id: user._id.toString(), name: user.name, role: user.role }, JWTSecret, {
                expiresIn: "15m"
            });

            res.cookie("token", payload, {
                httpOnly: true,
                secure: false,
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
            console.log('logout');
            return res.redirect('/auth/login');
            // next(error);
        }
    } catch (error) {
        next(error);
    }
};