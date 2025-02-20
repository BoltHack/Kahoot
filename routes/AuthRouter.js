const express = require('express');
const {registerView, registerNewUser, loginView, loginUser, sessionExpiredView, forgetPasswordView, sendEmail, accountRecoveryView, accountRecovery, logout} = require('../controllers/AuthController')
const {validateRegister, validateLogin} =require('../middlewares/validate')
const {checkEmail} = require("../middlewares/checkEmail");
const {verifyToken} = require("../middlewares/authorization");
const {authenticateJWT} = require('../middlewares/jwtAuth');
const router = express.Router();

router.get('/register', registerView );
router.post(`/register/:ip`, validateRegister, checkEmail, registerNewUser);

router.get('/login', loginView);
router.post('/login/:ip',  validateLogin, loginUser);

router.get('/forget-password', forgetPasswordView);
router.post('/send-email/:ip', sendEmail);

router.get('/account-recovery', accountRecoveryView);
router.post('/send-code', accountRecovery);

router.get('/sessionExpired', sessionExpiredView);

router.post('/logout', authenticateJWT, logout);

module.exports = router;