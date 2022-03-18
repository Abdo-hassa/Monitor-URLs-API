const express = require('express');
const router = express.Router();

const { createCheck } = require('../controllers/checkController');
const { checkValidationErrors } = require('../utils/checkValidation');
const { isAuth } = require('../middlewares/authorizationMiddlewares');

router.post('/createcheck', isAuth,createCheck);

module.exports = router;
