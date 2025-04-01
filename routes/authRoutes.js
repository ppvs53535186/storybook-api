const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 使用者登入
router.post('/login', authController.login);

module.exports = router;