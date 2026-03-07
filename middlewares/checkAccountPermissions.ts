import {Request, Response, NextFunction} from "express";

const {UsersModel} = require("../models/UsersModel");

interface CustomRequest extends Request {
    user?: {
        id: string;
        [key: string]: any;
    },
}
export const checkAccountPermissions = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return next();
        }

        if (!req.user || !req.user.id) return next();

        const userInfo = await UsersModel.findById(req.user.id).lean();

        if (userInfo && userInfo.expiresAt && req.originalUrl !== "/auth/account-deletion-process") {
            return res.redirect('/auth/account-deletion-process');
        }
        next();

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}