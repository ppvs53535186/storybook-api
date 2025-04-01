const express = require('express');
const router = express.Router();
const promptController = require('../controllers/promptController');

// 4. 生成生圖所需的 Prompt
router.post('/', promptController.generateImagePrompt);

module.exports = router;