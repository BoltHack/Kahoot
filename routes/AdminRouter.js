const express = require('express');
const {authenticateJWT} = require('../middlewares/jwtAuth');
const {verifyPermissions} = require('../middlewares/permissionsAuthorization');

const {
    userContactsViewAdmin, newsViewAdmin, redactionNewsViewAdmin, listUsersViewAdmin, listNewsViewAdmin,
    adminPanelViewAdmin, listReviewsViewAdmin
} = require('../controllers/AdminController')
const {
    postNews, postImage, redactionNews, deleteNews, deleteReview, deleteUser, addRole
} = require('../controllers/PostController')
const {appData} = require("../middlewares/appData");
const router = express.Router();
const upload = require('../middlewares/multer');

router.get('/admin-panel', verifyPermissions('Admin'), authenticateJWT, appData, adminPanelViewAdmin);
router.get('/user-contacts', verifyPermissions('Admin'), authenticateJWT, appData, userContactsViewAdmin);
router.get('/post-news', verifyPermissions('Admin'), authenticateJWT, appData, newsViewAdmin);
router.get('/redaction-news/:news_id',
    verifyPermissions('Admin'),
    authenticateJWT,
    // upload.fields([
    //     { name: 'image0' },
    //     { name: 'image1' },
    //     { name: 'image2' },
    //     { name: 'image3' },
    //     { name: 'image4' }
    // ]),
    redactionNewsViewAdmin);
router.get('/list-news', verifyPermissions('Admin'), authenticateJWT, appData, listNewsViewAdmin);

router.get('/list-users', verifyPermissions('Admin'), authenticateJWT, appData, listUsersViewAdmin);

router.get('/list-reviews', verifyPermissions('Admin'), authenticateJWT, appData, listReviewsViewAdmin);

router.post('/post-news', verifyPermissions('Admin'), appData, postNews);
router.post('/post-image/:postType', verifyPermissions('Admin'), appData, postImage);
router.post('/delete-news/:news_id', verifyPermissions('Admin'), authenticateJWT, appData, deleteNews);
router.post('/redaction-news', verifyPermissions('Admin'), authenticateJWT, appData, redactionNews);
router.post('/delete-review/:review_id', verifyPermissions('Admin'), authenticateJWT, appData, deleteReview);
router.post('/delete-user/:user_id', verifyPermissions('Admin'), appData, deleteUser);
router.post('/add-role', verifyPermissions('Admin'), appData, addRole);

module.exports = router;