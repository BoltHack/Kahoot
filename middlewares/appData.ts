import {Request, Response, NextFunction} from "express";

interface BasicData {
    locale: string;
    notifications: string;
    darkTheme: string;
}

interface CustomRequest extends Request {
    basicData?: BasicData;
}

export const appData = async (req: CustomRequest, res: Response, next: NextFunction) => {

    req.basicData = {
        locale: req.cookies['locale'] || 'en',
        notifications: req.cookies['notifications'] || 'on',
        darkTheme: req.cookies['darkTheme'] || 'on',
    };

    next();
}

// module.exports = { appData };