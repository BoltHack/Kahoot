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

        if (userInfo && userInfo.expiresAt) {
            if (req.originalUrl !== "/auth/account-deletion-process") {
                return res.status(403).json({
                    message: "Access denied: account is scheduled for deletion",
                    code: "ACCOUNT_DELETION_PENDING"
                });
            }
        }
        next();

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}