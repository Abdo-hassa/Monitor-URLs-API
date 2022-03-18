const express = require('express');
const router = express.Router();

const {
	login,
	register,
	Deactivate,
	Activate,
	refreshToken,
	resetPassword,
	newPassword,
} = require('../controllers/authController');
const { checkValidationErrors } = require('../utils/checkValidation');
const { isAuth } = require('../middlewares/authorizationMiddlewares');
const { loginValidator, registerValidator } = require('../validation/authValidation');

router.post('/register', registerValidator, checkValidationErrors, register);
router.post('/login', loginValidator, checkValidationErrors, login);
router.post('/reset', resetPassword);
router.post('/newpass', newPassword);
router.post('/deactivate', isAuth, Deactivate);
router.post('/activate', isAuth, Activate);
router.post('/refresh', isAuth, refreshToken);

module.exports = router;
