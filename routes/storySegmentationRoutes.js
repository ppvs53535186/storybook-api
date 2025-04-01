const express = require('express');
const router = express.Router();
const storySegmentationController = require('../controllers/storySegmentationController');

// 7.1 依據故事自動生成「who / where / what」
router.post('/', storySegmentationController.segmentStory);

module.exports = router;