const express = require('express');
const {authenticateJWT} = require('../middlewares/jwtAuth');
const {verifyPermissions} = require('../middlewares/permissionsAuthorization');

const {
    userContactsViewAdmin, newsViewAdmin, redactionNewsViewAdmin, listUsersViewAdmin, listNewsViewAdmin, adminPanelViewAdmin
} = require('../controllers/AdminController')
const {postNews, redactionNews, deleteNews, deleteUser, addRole} = require('../controllers/PostController')
const router = express.Router();
const upload = require('../middlewares/multer');

router.get('/admin-panel', verifyPermissions('Admin'), authenticateJWT, adminPanelViewAdmin);
router.get('/user-contacts', verifyPermissions('Admin'), authenticateJWT, userContactsViewAdmin);
router.get('/post-news', verifyPermissions('Admin'), authenticateJWT, newsViewAdmin);
router.get('/redaction-news/:news_id',
    verifyPermissions('Admin'),
    authenticateJWT,
    upload.fields([
        { name: 'image0' },
        { name: 'image1' },
        { name: 'image2' },
        { name: 'image3' },
        { name: 'image4' }
    ]),
    redactionNewsViewAdmin);
router.get('/list-news', verifyPermissions('Admin'), authenticateJWT, listNewsViewAdmin);

router.get('/list-users', verifyPermissions('Admin'), authenticateJWT, listUsersViewAdmin);

router.post('/post-news', verifyPermissions('Admin'), postNews);
router.post('/delete-news/:news_id', verifyPermissions('Admin'), authenticateJWT, deleteNews);
router.post('/redaction-news/:news_id', verifyPermissions('Admin'), authenticateJWT, redactionNews);
router.post('/delete-user/:user_id', verifyPermissions('Admin'), deleteUser);
router.post('/add-role', verifyPermissions('Admin'), addRole);

module.exports = router;