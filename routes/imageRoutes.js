const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// 5.1 提交圖片生成任務
router.post('/', imageController.generateImage);

module.exports = router;