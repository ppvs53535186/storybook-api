const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// 1.1 建立/更新繪本基本資訊
router.post('/', bookController.createOrUpdateBook);

// 1.2 取得繪本基本資訊
router.get('/', bookController.getBook);

module.exports = router;