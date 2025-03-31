const mongoose = require('mongoose');
const {AdminUserContactsModel} = require('../models/AdminUserContactsModel')
const {NewsModel} = require("../models/NewsModel");
const {UsersModel} = require("../models/UsersModel");
class AdminController{
    static userContactsViewAdmin = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const user = req.user;

            const userContacts = await AdminUserContactsModel.find({});

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            return res.render(locale === 'en' ? 'en/admin/user-contacts' : 'ru/admin/user-contacts', {user, userContacts, locale});
        } catch (e) {
            next(e);
        }
    }

    static newsViewAdmin = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const user = req.user;

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            return res.render(locale === 'en' ? 'en/admin/post-news' : 'ru/admin/post-news', {user, locale});
        } catch (e) {
            next(e);
        }
    }

    static redactionNewsViewAdmin = async (req, res, next) => {
        try {
            const { news_id } = req.params;
            const newsInfo = await NewsModel.findById(news_id);
            const locale = req.cookies['locale'] || 'en';

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
            }

            if (!newsInfo) {
                return res.redirect(`/admin/redaction-news/${news_id}`);
            }

            return res.render(locale === 'en' ? 'en/admin/redaction-news' : 'ru/admin/redaction-news', { newsInfo, locale });
        } catch (e) {
            next(e);
        }
    }

    static listNewsViewAdmin = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const user = req.user;

            const listNews = await NewsModel.find({});

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            return res.render(locale === 'en' ? 'en/admin/list-news' : 'ru/admin/list-news', {user, listNews, locale});
        } catch (e) {
            next(e);
        }
    }

    static adminPanelViewAdmin = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const user = req.user;

            const allUsers = await UsersModel.find({role: 'User'});

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            return res.render(locale === 'en' ? 'en/admin/admin-panel' : 'ru/admin/admin-panel', {user, allUsers, locale});
        } catch (e) {
            next(e);
        }
    }

}

module.exports = AdminController;