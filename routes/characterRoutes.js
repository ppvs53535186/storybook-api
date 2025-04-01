const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');

// 2.1 建立/更新角色
router.post('/', characterController.createOrUpdateCharacter);

// 2.2 取得角色資訊
router.get('/', characterController.getCharacter);

module.exports = router;