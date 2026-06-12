/**
 * Authentication route definitions.
 */

const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { registerRules, loginRules } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
