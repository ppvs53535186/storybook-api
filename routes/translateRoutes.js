const express = require('express');
const router = express.Router();
const translateController = require('../controllers/translateController');

// 6.1 翻譯 API
router.post('/', translateController.translateText);

module.exports = router;