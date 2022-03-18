const express = require('express');
const router = express.Router();

const {
	login,
	register,
	verification,
	confirmation,
	resetPassword,
	newPassword,
} = require('../controllers/authController');
const { checkValidationErrors } = require('../utils/checkValidation');
const { isAuth } = require('../middlewares/authorizationMiddlewares');
const { loginValidator, registerValidator } = require('../validation/authValidation');

router.post('/register', registerValidator, checkValidationErrors, register);
router.post('/login', loginValidator, checkValidationErrors, login);
router.post('/verify', verification);
router.get('/verify/:userid/:token', confirmation);
router.post('/reset', resetPassword);
router.post('/newpass', newPassword);

module.exports = router;
