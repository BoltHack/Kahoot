import { Request, Response, NextFunction } from "express";

import { Document } from "mongoose";
import jwt from "jsonwebtoken";
import { UsersModel } from "../models/UsersModel";


interface TokenPayload {
    id: string;
    name: string;
    role: string;
}

interface UserData extends Document {
    name: string;
    role: string;
}

export async function accessToken(req: Request, res: Response, next: NextFunction) {
    try {
        const JWTSecret = process.env.JWTSecret!;
        const refreshTokenSecret = process.env.refreshTokenSecret!;

        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.sendStatus(401);
        }

        let decoded: TokenPayload;

        try {
            decoded = jwt.verify(refreshToken, refreshTokenSecret) as TokenPayload;
        } catch (err) {
            console.log(err);
            return res.sendStatus(403);
        }

        const user = await UsersModel.findById(decoded.id) as UserData || null;
        if (!user) {
            return res.sendStatus(403);
        }

        const newAccessToken = jwt.sign({
            id: user._id.toString(),
            name: user.name,
            role: user.role
        }, JWTSecret, { expiresIn: '15m' });

        res.cookie('token', newAccessToken, { httpOnly: true, secure: true, maxAge: 15 * 60 * 1000 });

        return res.json({ token: newAccessToken });
    } catch (err) {
        next(err);
    }
}

// module.exports = { accessToken };
