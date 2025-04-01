/**
 * 故事段落控制器
 * 處理繪本故事內容的創建、更新和取得
 */
const supabase = require('../config/supabase');

/**
 * 建立或更新故事段落
 * POST /api/book/data
 */
const createOrUpdateStoryPage = async (req, res) => {
  try {
    const { 
      book_id, 
      page, 
      user_input, 
      en_user_input, 
      position_input, 
      user_pic_select, 
      user_pic_input 
    } = req.body;
    
    const userId = req.user.id;
    
    // 驗證必要欄位
    if (!book_id || !page) {
      return res.status(400).json({
        state: false,
        code: 400,
        msg: "缺少必要欄位: book_id 或 page",
        data: null
      });
    }
    
    // 檢查繪本是否存在且屬於該使用者
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('id', book_id)
      .eq('user_id', userId)
      .single();
    
    if (bookError) {
      if (bookError.code === 'PGRST116') {
        return res.status(404).json({
          state: false,
          code: 404,
          msg: "找不到指定的繪本或您沒有權限",
          data: null
        });
      }
      throw bookError;
    }
    
    // 檢查該頁是否已存在
    const { data: existingPage, error: pageError } = await supabase
      .from('story_pages')
      .select('id')
      .eq('book_id', book_id)
      .eq('page', page)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (pageError) throw pageError;
    
    let storyPageData;
    
    if (existingPage) {
      // 更新現有頁面
      const { data, error } = await supabase
        .from('story_pages')
        .update({
          user_input,
          en_user_input,
          position_input,
          user_pic_select,
          user_pic_input,
          pic_generated: false,  // 重設圖片生成狀態
          updated_at: new Date()
        })
        .eq('id', existingPage.id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      storyPageData = data;
    } else {
      // 創建新頁面
      const { data, error } = await supabase
        .from('story_pages')
        .insert({
          user_id: userId,
          book_id,
          page,
          user_input,
          en_user_input,
          position_input,
          user_pic_select,
          user_pic_input,
          pic_generated: false
        })
        .select()
        .single();
      
      if (error) throw error;
      storyPageData = data;
    }
    
    // 獲取與此頁面相關的生成圖片
    const { data: imageData, error: imageError } = await supabase
      .from('generated_images')
      .select('image_url')
      .eq('story_page_id', storyPageData.id)
      .eq('user_id', userId);
    
    if (imageError) throw imageError;
    
    // 組裝響應數據
    const story_pic_ai = imageData ? imageData.map(img => img.image_url) : [];
    
    // 返回成功響應
    res.status(200).json({
      state: true,
      code: 0,
      msg: "success",
      data: {
        user_pic_select: storyPageData.user_pic_select,
        position_input: storyPageData.position_input,
        user_input: storyPageData.user_input,
        en_user_input: storyPageData.en_user_input,
        pic_generated: storyPageData.pic_generated ? 1 : 0,
        story_pic_ai,
        user_pic_input: storyPageData.user_pic_input
      }
    });
  } catch (error) {
    console.error('Create/Update story page error:', error);
    res.status(500).json({
      state: false,
      code: 500,
      msg: error.message || "伺服器內部錯誤",
      data: null
    });
  }
};

/**
 * 取得故事段落
 * GET /api/book/data
 */
const getStoryPage = async (req, res) => {
  try {
    const { book_id, page } = req.query;
    const userId = req.user.id;
    
    // 參數驗證
    if (!book_id || !page) {
      return res.status(400).json({
        state: false,
        code: 400,
        msg: "必須提供 book_id 和 page 參數",
        data: null
      });
    }
    
    // 從數據庫中查詢資料
    const { data: storyPageData, error: pageError } = await supabase
      .from('story_pages')
      .select('*')
      .eq('book_id', book_id)
      .eq('page', page)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (pageError) throw pageError;
    
    // 如果找不到數據，返回空結果
    if (!storyPageData) {
      return res.status(200).json({
        state: true,
        code: 0,
        msg: "查無資料",
        data: null
      });
    }
    
    // 獲取與此頁面相關的生成圖片
    const { data: imageData, error: imageError } = await supabase
      .from('generated_images')
      .select('image_url')
      .eq('story_page_id', storyPageData.id)
      .eq('user_id', userId);
    
    if (imageError) throw imageError;
    
    // 組裝響應數據
    const story_pic_ai = imageData ? imageData.map(img => img.image_url) : [];
    
    // 返回成功響應
    res.status(200).json({
      state: true,
      code: 0,
      msg: "success",
      data: {
        user_pic_select: storyPageData.user_pic_select,
        position_input: storyPageData.position_input,
        user_input: storyPageData.user_input,
        en_user_input: storyPageData.en_user_input,
        pic_generated: storyPageData.pic_generated ? 1 : 0,
        story_pic_ai,
        user_pic_input: storyPageData.user_pic_input
      }
    });
  } catch (error) {
    console.error('Get story page error:', error);
    res.status(500).json({
      state: false,
      code: 500,
      msg: error.message || "伺服器內部錯誤",
      data: null
    });
  }
};

module.exports = {
  createOrUpdateStoryPage,
  getStoryPage
};