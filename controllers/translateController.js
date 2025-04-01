/**
 * 翻譯控制器
 * 處理中文到英文的翻譯功能
 */

/**
 * 將中文文本翻譯成英文
 * POST /api/translate
 */
const translateText = async (req, res) => {
  try {
    const { input_text } = req.body;
    
    if (!input_text) {
      return res.status(400).json({
        state: false,
        code: 400,
        msg: "缺少翻譯文本參數",
        data: null
      });
    }
    
    // 在實際應用中，這裡應該呼叫翻譯 API 或 AI 引擎
    // 現在我們使用模擬數據
    
    // 假設這是翻譯 API 返回的結果
    let translatedText = "In a mysterious garden, Lightning discovered a magical map.";
    
    // 如果輸入的文本與範例相符，返回特定翻譯
    if (input_text === "在一片神秘花園中，閃電發現了一張神奇地圖。") {
      translatedText = "In a mysterious garden, Lightning discovered a magical map.";
    }
    
    // 返回成功響應
    res.status(200).json({
      state: true,
      code: 0,
      msg: "success",
      data: {
        translated_text: translatedText
      }
    });
  } catch (error) {
    console.error('Translate text error:', error);
    res.status(500).json({
      state: false,
      code: 500,
      msg: error.message || "伺服器內部錯誤",
      data: null
    });
  }
};

module.exports = {
  translateText
};