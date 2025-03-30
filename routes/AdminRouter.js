const express = require('express');
const {
} = require('../controllers/AdminController')
const {authenticateJWT} = require('../middlewares/jwtAuth');
const {verifyPermissions} = require('../middlewares/permissionsAuthorization');

const {userContactsViewAdmin, newsViewAdmin, redactionNewsViewAdmin} = require('../controllers/AdminController')
const {postNews, redactionNews, deleteNews} = require('../controllers/PostController')
const router = express.Router();

router.get('/user-contacts', verifyPermissions('Admin'), authenticateJWT, userContactsViewAdmin);
router.get('/post-news', verifyPermissions('Admin'), authenticateJWT, newsViewAdmin);
router.get('/redaction-news/:news_id', verifyPermissions('Admin'), authenticateJWT, redactionNewsViewAdmin);

router.post('/post-news', verifyPermissions('Admin'), postNews);
router.post('/delete-news/:news_id', verifyPermissions('Admin'), deleteNews);
router.post('/redaction-news/:news_id', verifyPermissions('Admin'), redactionNews);

module.exports = router;