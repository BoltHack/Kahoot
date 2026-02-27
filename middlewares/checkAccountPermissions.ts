import {Request, Response, NextFunction} from "express";

const {authenticateJWT} = require("./jwtAuth");
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

        await new Promise<void>((resolve, reject) => {
            authenticateJWT(req, res, (err: any) => {
                if (err) return resolve();
                resolve();
            });
        });

        if (!req.user || !req.user.id) {
            return next();
        }

        const userInfo: any = await UsersModel.findById(req.user.id).lean();

        if (userInfo && userInfo.expiresAt) {
            if (req.originalUrl !== "/auth/account-deletion-process") {
                console.log('name:', userInfo.name);
                return res.redirect("/auth/account-deletion-process");
            }
        }
        next();

    } catch (e) {
        next(e);
    }
}

// module.exports = { checkAccountPermissions };