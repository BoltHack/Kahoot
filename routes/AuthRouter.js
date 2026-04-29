const express = require('express');
const {registerView, registerNewUser, loginView, loginUser, sessionExpiredView, forgetPasswordView,
    sendEmail, accountRecoveryView, accountRecovery, logout, changePassword, accountDelete,
    accountDeletionProcess, accountRestore, accountRecover, logoutAllAccounts
} = require('../controllers/AuthController')
const {validateRegister, validateLogin} = require('../middlewares/validate')
const {authenticateJWT} = require('../middlewares/jwtAuth');
const router = express.Router();

router.get('/register', registerView );
router.post(`/register/:ip`, validateRegister, registerNewUser);

router.get('/login', loginView);
router.post('/login/:ip',  validateLogin, loginUser);

router.get('/forget-password', forgetPasswordView);
router.post('/send-email/:ip', sendEmail);

router.get('/account-recovery', accountRecoveryView);
router.post('/send-code', accountRecovery);

router.get('/sessionExpired', sessionExpiredView);

router.post('/logout', logout);
router.post('/logoutAllAccounts', authenticateJWT, logoutAllAccounts);

router.get('/account-deletion-process', authenticateJWT, accountDeletionProcess);
router.post('/account-delete', authenticateJWT, accountDelete);
router.post('/account-restore', authenticateJWT, accountRestore);
router.get('/account-recover/:code', authenticateJWT, accountRecover);

router.post('/changePassword', authenticateJWT, changePassword);

module.exports = router;