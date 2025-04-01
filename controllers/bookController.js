/**
 * 繪本控制器
 * 處理繪本基本資訊的創建、更新和取得
 */
const supabase = require('../config/supabase');

/**
 * 建立或更新繪本基本資訊
 * POST /api/book
 */
const createOrUpdateBook = async (req, res) => {
  try {
    const { book_name_ch, book_name_en, style, book_author, preface } = req.body;
    const userId = req.user.id;
    
    // 驗證必要欄位
    if (!book_name_ch) {
      return res.status(400).json({
        state: false,
        code: 400,
        msg: "繪本中文名稱為必填欄位",
        data: null
      });
    }

    // 檢查該使用者是否已有繪本
    const { data: existingBooks, error: fetchError } = await supabase
      .from('books')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
      
    if (fetchError) {
      throw fetchError;
    }

    let bookData;
    
    if (existingBooks && existingBooks.length > 0) {
      // 更新現有繪本
      const bookId = existingBooks[0].id;
      
      const { data, error } = await supabase
        .from('books')
        .update({
          book_name_ch,
          book_name_en,
          style,
          book_author,
          preface,
          updated_at: new Date()
        })
        .eq('id', bookId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      bookData = data;
    } else {
      // 創建新繪本
      const { data, error } = await supabase
        .from('books')
        .insert({
          user_id: userId,
          book_name_ch,
          book_name_en,
          style,
          book_author,
          preface
        })
        .select()
        .single();
      
      if (error) throw error;
      bookData = data;
    }
    
    // 返回成功響應
    res.status(200).json({
      state: true,
      code: 0,
      msg: "success",
      data: {
        book_id: bookData.id,
        book_name_ch: bookData.book_name_ch,
        book_name_en: bookData.book_name_en,
        style: bookData.style,
        book_author: bookData.book_author,
        preface: bookData.preface,
        book_frontcover: bookData.book_frontcover,
        book_backcover: bookData.book_backcover
      }
    });
  } catch (error) {
    console.error('Create/Update book error:', error);

    res.status(500).json({
      state: false,
      code: 500,
      msg: error.message || "伺服器內部錯誤",
      data: null
    });
  }
};

/**
 * 取得繪本資訊
 * GET /api/book
 */
const getBook = async (req, res) => {
  try {
    // 從用戶資訊中取得使用者 ID
    const userId = req.user.id;
    
    // 從數據庫中查詢資料
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .single();
    
    if (error) {
      // 如果是找不到資料的錯誤，返回空結果而非錯誤
      if (error.code === 'PGRST116') {
        return res.status(200).json({
          state: true,
          code: 0,
          msg: "查無繪本資料",
          data: null
        });
      }
      throw error;
    }
    
    // 返回成功響應
    res.status(200).json({
      state: true,
      code: 0,
      msg: "success",
      data: {
        book_id: data.id,
        book_name_ch: data.book_name_ch,
        book_name_en: data.book_name_en,
        style: data.style,
        book_frontcover: data.book_frontcover,
        book_backcover: data.book_backcover,
        preface: data.preface,
        book_author: data.book_author
      }
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      state: false,
      code: 500,
      msg: error.message || "伺服器內部錯誤",
      data: null
    });
  }
};

module.exports = {
  createOrUpdateBook,
  getBook
};