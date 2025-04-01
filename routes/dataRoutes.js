const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// 3.1 建立/更新故事段落
router.post('/', dataController.createOrUpdateStoryPage);

// 3.2 取得故事段落
router.get('/', dataController.getStoryPage);

module.exports = router;