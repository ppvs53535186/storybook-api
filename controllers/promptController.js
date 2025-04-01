/**
 * 提示詞控制器
 * 處理生成 AI 圖像所需的提示詞
 */

/**
 * 生成生圖所需的 Prompt
 * POST /api/book/prompt
 */
const generateImagePrompt = async (req, res) => {
  try {
    const { scene_description } = req.body;
    
    if (!scene_description) {
      return res.status(400).json({
        state: false,
        code: 400,
        msg: "缺少場景描述參數",
        data: null
      });
    }
    
    // 在實際應用中，這裡應該呼叫 AI 引擎生成 prompt
    // 現在我們使用模擬數據
    
    // 以下是模擬的 AI 生成結果
    const promptData = {
      action_background: "在一個充滿星際元素的太空背景中，太空貓正在專注地設計一個光束洞陷阱，以智取潛伏的太空海盜。背景是遼闊的宇宙空間，點綴著閃爍的星星和遙遠的星系。",
      character_features: "太空貓，擁有閃亮的銀色毛皮與明亮的藍色眼睛，穿著高科技太空裝，攜帶工具包，神情專注地觀察著準備製作的陷阱。"
    };
    
    // 返回成功響應
    res.status(200).json({
      state: true,
      code: 0,
      msg: "success",
      data: promptData
    });
  } catch (error) {
    console.error('Generate image prompt error:', error);
    res.status(500).json({
      state: false,
      code: 500,
      msg: error.message || "伺服器內部錯誤",
      data: null
    });
  }
};

module.exports = {
  generateImagePrompt
};