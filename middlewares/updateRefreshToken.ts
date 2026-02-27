import {Request, Response, NextFunction} from "express";

import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UsersModel } from "../models/UsersModel";

interface RefreshTokenPayload {
    id: string;
    tokenVersion: number;
}

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

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const JWTSecret = process.env.JWTSecret!;
        const refreshTokenSecret = process.env.refreshTokenSecret!;

        const { refreshToken } = req.cookies;

        if (!refreshToken) return res.sendStatus(401);

        let decoded: RefreshTokenPayload;

        try {
            decoded = jwt.verify(refreshToken, refreshTokenSecret) as RefreshTokenPayload;
        } catch (err) {
            console.error(err);
            return res.sendStatus(403);
        }

        const user = await UsersModel.findById(decoded.id);
        if (!user) return res.sendStatus(403);

        const pastHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        if (pastHash !== user.refreshTokenHash) return res.sendStatus(403);
        if (decoded.tokenVersion !== user.tokenVersion) return res.sendStatus(403);

        user.tokenVersion += 1;
        const newRefreshToken = jwt.sign({
            id: user._id.toString(),
            tokenVersion: user.tokenVersion
        }, refreshTokenSecret, { expiresIn: '10d' });

        user.refreshTokenHash = crypto
            .createHash('sha256')
            .update(newRefreshToken)
            .digest('hex');
        await user.save();

        const newAccessToken = jwt.sign({
            id: user._id.toString(),
            name: user.name,
            role: user.role
        }, JWTSecret, { expiresIn: '15m' });

        res.cookie('token', newAccessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: parseMaxAge('15m') });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: parseMaxAge('10d') });

        return res.json({ token: newAccessToken, newRefreshToken });
    } catch (err) {
        next(err);
    }
}

// module.exports = { refreshToken };