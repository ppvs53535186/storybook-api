/**
 * 聊天機器人路由
 * 處理 AI 對話相關功能
 */
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// 8.1 聊天機器人 API
router.post('/', chatController.chat);

module.exports = router;