const mongoose = require('mongoose');
const {AdminUserContactsModel} = require('../models/AdminUserContactsModel')
const {NewsModel} = require("../models/NewsModel");
const {UsersModel} = require("../models/UsersModel");
class AdminController{
    static userContactsViewAdmin = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            const user = req.user;

            const userContacts = await AdminUserContactsModel.find({});

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            return res.render(locale === 'en' ? 'en/admin/user-contacts' : 'ru/admin/user-contacts', {user, userContacts, locale, darkTheme});
        } catch (err) {
            next(err);
        }
    }

    static newsViewAdmin = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            const user = req.user;

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            return res.render(locale === 'en' ? 'en/admin/post-news' : 'ru/admin/post-news', {user, locale, darkTheme});
        } catch (err) {
            next(err);
        }
    }

    static redactionNewsViewAdmin = async (req, res, next) => {
        try {
            const { news_id } = req.params;
            const user = req.user
            const newsInfo = await NewsModel.findById(news_id);
            const locale = req.cookies['locale'] || 'en';
            const darkTheme = req.cookies['darkTheme'] || 'on';

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
            }

            if (!newsInfo) {
                return res.redirect(`/admin/redaction-news/${news_id}`);
            }

            return res.render(locale === 'en' ? 'en/admin/redaction-news' : 'ru/admin/redaction-news', { newsInfo, user, locale, darkTheme });
        } catch (err) {
            next(err);
        }
    }

    static listNewsViewAdmin = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            const user = req.user;

            const listNews = await NewsModel.find({}).sort({fullDate: -1});

            const authorIds = listNews.map(news => news.author.authorId);
            const authors = await UsersModel.find({ _id: { $in: authorIds } });
            const enrichedNews = listNews.map(news => {
                const author = authors.find(a => a._id.toString() === news.author.authorId.toString());
                return {
                    ...news.toObject(),
                    authorImage: author ? author.image : '/images/default-avatar.png'
                };
            });

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            return res.render(locale === 'en' ? 'en/admin/list-news' : 'ru/admin/list-news', {user, listNews: enrichedNews, locale, darkTheme});
        } catch (err) {
            next(err);
        }
    }

    static listUsersViewAdmin = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            const user = req.user;

            const allUsers = await UsersModel.find({role: { $in: [ 'User', 'TechSupport' ] } });

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            return res.render(locale === 'en' ? 'en/admin/list-users' : 'ru/admin/list-users', {user, allUsers, locale, darkTheme});
        } catch (err) {
            next(err);
        }
    }

    static adminPanelViewAdmin = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            const user = req.user;

            const allStaff = await UsersModel.find({role: { $in: [ 'Admin', 'TechSupport' ] } });

            if (!req.cookies['locale']) {
                res.cookie('locale', locale, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000  });
            }

            return res.render(locale === 'en' ? 'en/admin/admin-panel' : 'ru/admin/admin-panel', {user, allStaff, locale, darkTheme});
        } catch (err) {
            next(err);
        }
    }

    static listReviewsViewAdmin = async (req, res, next) => {
        try {
            const locale = req.cookies['locale'] || 'en';
            const darkTheme = req.cookies['darkTheme'] || 'on';
            const user = req.user;

            const filteredQuery = { 'settings.myReview.review': { $exists: true, $ne: '' } };

            const allReviews = await UsersModel.find(filteredQuery)
                .sort({ 'settings.myReview.date': -1 })
                .lean();

            const reviews = allReviews.map(user => ({
                id: user._id,
                name: user.name,
                image: user.image,
                review: user.settings.myReview.review,
                grade: user.settings.myReview.grade,
                date: user.settings.myReview.date
            }));

            return res.render(locale === 'en' ? 'en/admin/list-reviews' : 'ru/admin/list-reviews', { user, allReviews: reviews, darkTheme, locale })
        } catch (err) {
            next(err);
        }
    }

}

module.exports = AdminController;