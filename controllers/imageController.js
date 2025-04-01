/**
 * 圖像控制器
 * 處理 AI 圖像生成相關功能
 */
const supabase = require('../config/supabase');
const axios = require('axios');

/**
 * 提交圖片生成任務
 * POST /api/book/image
 */
const generateImage = async (req, res) => {
  try {
    const { story_pic_prompt, style, book_id, page } = req.body;
    const userId = req.user.id;
    
    if (!story_pic_prompt || !book_id || !page) {
      return res.status(400).json({
        state: false,
        code: 400,
        msg: "缺少必要參數: story_pic_prompt, book_id 或 page",
        data: null
      });
    }
    
    // 獲取故事頁面 ID
    const { data: storyPageData, error: pageError } = await supabase
      .from('story_pages')
      .select('id')
      .eq('book_id', book_id)
      .eq('page', page)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (pageError) throw pageError;
    
    if (!storyPageData) {
      return res.status(404).json({
        state: false,
        code: 404,
        msg: "找不到指定的故事頁面",
        data: null
      });
    }
    
    // 在實際應用中，這裡應該呼叫 AI 圖像生成引擎
    // 然後將生成的圖片下載並存儲到您的服務器或 Supabase Storage
    
    // 這是模擬的 AI 圖像生成回應
    // 實際系統中，這裡可以呼叫外部 API 像是 Stability.ai, Replicate.com 等

    // 模擬 AI 圖像生成的延遲
    // await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 假設我們成功生成了圖片，並將其保存到檔案系統或雲存儲中
    // 這裡返回假設的 URL
    const imageUrls = [
      "https://via.placeholder.com/512x512.png?text=AI+Generated+Image+1",
      "https://via.placeholder.com/512x512.png?text=AI+Generated+Image+2"
    ];
    
    // 將生成的圖片資訊保存到資料庫
    for (const imageUrl of imageUrls) {
      const { error: insertError } = await supabase
        .from('generated_images')
        .insert({
          user_id: userId,
          story_page_id: storyPageData.id,
          image_url: imageUrl,
          prompt: story_pic_prompt,
          style
        });
      
      if (insertError) throw insertError;
    }
    
    // 更新故事頁面的圖片生成狀態
    const { error: updateError } = await supabase
      .from('story_pages')
      .update({ pic_generated: true })
      .eq('id', storyPageData.id)
      .eq('user_id', userId);
    
    if (updateError) throw updateError;
    
    // 返回成功響應
    res.status(200).json({
      state: true,
      code: 0,
      msg: "success",
      data: {
        image_urls: imageUrls
      }
    });
  } catch (error) {
    console.error('Generate image error:', error);
    res.status(500).json({
      state: false,
      code: 500,
      msg: error.message || "伺服器內部錯誤",
      data: null
    });
  }
};

module.exports = {
  generateImage
};