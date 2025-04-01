/**
 * 故事分段控制器
 * 處理將故事分解為 who/where/what 組件的功能
 */

/**
 * 將故事片段分解為 who/where/what 組件
 * POST /api/book/story-segmentation
 */
const segmentStory = async (req, res) => {
  try {
    const { story_segment } = req.body;
    
    if (!story_segment) {
      return res.status(400).json({
        state: false,
        code: 400,
        msg: "缺少故事片段參數",
        data: null
      });
    }
    
    // 在實際應用中，這裡應該呼叫 AI 引擎進行故事分析
    // 現在我們使用模擬數據
    
    // 為特定範例提供固定回應
    let segmentationResult = {
      who: "霓虹粉色獨角獸閃電、藍色小龍",
      where: "傾盆大雨的森林或山谷",
      what: "在大雨中相遇並成為朋友"
    };
    
    // 如果輸入的故事與範例相符，返回特定分段結果
    if (story_segment === "閃電在大雨中邂逅了一只藍色的小龍，它們快速成為了好朋友。") {
      segmentationResult = {
        who: "霓虹粉色獨角獸閃電、藍色小龍",
        where: "傾盆大雨的森林或山谷",
        what: "在大雨中相遇並成為朋友"
      };
    }
    
    // 返回成功響應
    res.status(200).json({
      state: true,
      code: 0,
      msg: "success",
      data: segmentationResult
    });
  } catch (error) {
    console.error('Segment story error:', error);
    res.status(500).json({
      state: false,
      code: 500,
      msg: error.message || "伺服器內部錯誤",
      data: null
    });
  }
};

module.exports = {
  segmentStory
};