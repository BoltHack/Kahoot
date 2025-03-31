const express = require('express');
const {
} = require('../controllers/AdminController')
const {authenticateJWT} = require('../middlewares/jwtAuth');
const {verifyPermissions} = require('../middlewares/permissionsAuthorization');

const {
    userContactsViewAdmin, newsViewAdmin, redactionNewsViewAdmin, adminPanelViewAdmin, listNewsViewAdmin
} = require('../controllers/AdminController')
const {postNews, redactionNews, deleteNews, deleteUser} = require('../controllers/PostController')
const router = express.Router();

router.get('/user-contacts', verifyPermissions('Admin'), authenticateJWT, userContactsViewAdmin);
router.get('/post-news', verifyPermissions('Admin'), authenticateJWT, newsViewAdmin);
router.get('/redaction-news/:news_id', verifyPermissions('Admin'), authenticateJWT, redactionNewsViewAdmin);
router.get('/list-news', verifyPermissions('Admin'), authenticateJWT, listNewsViewAdmin);

router.get('/admin-panel', verifyPermissions('Admin'), authenticateJWT, adminPanelViewAdmin);

router.post('/post-news', verifyPermissions('Admin'), postNews);
router.post('/delete-news/:news_id', verifyPermissions('Admin'), authenticateJWT, deleteNews);
router.post('/redaction-news/:news_id', verifyPermissions('Admin'), authenticateJWT, redactionNews);
router.post('/delete-user/:user_id', verifyPermissions('Admin'), deleteUser);

module.exports = router;