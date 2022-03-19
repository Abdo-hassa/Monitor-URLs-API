const express = require('express');
const router = express.Router();

const { monitorUrl } = require('../controllers/monitor');
const { checkValidationErrors } = require('../utils/checkValidation');
const { isAuth } = require('../middlewares/authorizationMiddlewares');

router.get('/:checkId',monitorUrl);

module.exports = router;
