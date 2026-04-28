import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UsersModel } from "../models/UsersModel";

interface JwtPayload {
    id: string;
    name: string;
    role: string;
    tokenVersion: number;
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

        const authHeader = req.headers.authorization;
        if (!token && authHeader && authHeader?.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        let decodedRefresh: RefreshPayload | null = null;
        try {
            if (refreshToken) {
                decodedRefresh  = await verifyToken<RefreshPayload>(refreshToken, refreshTokenSecret);
            }
        } catch (error) {
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            console.log('logout');
            return res.redirect('/auth/login');
        }

        // const authHeader = req.headers.authorization;
        // if (!token && authHeader && authHeader?.startsWith("Bearer ")) {
        //     token = authHeader.split(" ")[1];
        // }

        let userInfo;

        if (token && decodedRefresh) {
            try {
                const user = await verifyToken<JwtPayload>(token, JWTSecret);

                userInfo = await UsersModel.findById(user.id);

                console.log('user', user);
                console.log('decodedRefresh', decodedRefresh.tokenVersion);

                if (!userInfo || userInfo.tokenVersion !== decodedRefresh.tokenVersion || user.tokenVersion !== decodedRefresh.tokenVersion ){
                    res.clearCookie('token');
                    res.clearCookie('refreshToken');
                    return res.status(403).json({ message: 'Session compromised' });
                }

                req.user = user;
                return next();
            } catch {
                console.log('Проблемы с Access токеном.');
            }
        }

        if (!decodedRefresh || !refreshToken) {
            res.clearCookie('token');
            return res.redirect('/auth/login');
        }

        userInfo = await UsersModel.findById(decodedRefresh.id);

        const currentHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        if (!userInfo || userInfo.refreshTokenHash !== currentHash || userInfo.tokenVersion !== decodedRefresh.tokenVersion) {
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            return res.status(403).json({ message: 'Session compromised' });
        }

        const payload = jwt.sign({
            id: userInfo._id.toString(),
            name: userInfo.name,
            role: userInfo.role,
            tokenVersion: userInfo.tokenVersion
        }, JWTSecret, { expiresIn: "15m" });

        res.cookie("token", payload, {
            httpOnly: true,
            secure: false,
            maxAge: 15 * 60 * 1000,
        });

        req.user = {
            id: userInfo._id.toString(),
            name: userInfo.name,
            role: userInfo.role,
            tokenVersion: userInfo.tokenVersion
        };
        return next();
    } catch (error) {
        next(error);
    }
};