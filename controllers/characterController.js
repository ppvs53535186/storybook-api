/**
 * 角色控制器
 * 處理繪本角色資訊的創建、更新和取得
 */
const supabase = require('../config/supabase');

/**
 * 建立或更新角色資訊
 * POST /api/book/character
 */
const createOrUpdateCharacter = async (req, res) => {
  try {
    const { name, features, image, prompt, character_id } = req.body;
    const userId = req.user.id;
    
    // 驗證必要欄位
    if (!name) {
      return res.status(400).json({
        state: false,
        code: 400,
        msg: "角色名稱為必填欄位",
        data: null
      });
    }
    
    // 查詢使用者的繪本
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();
    
    if (bookError) {
      // 如果找不到繪本，提示用戶需要先創建繪本
      if (bookError.code === 'PGRST116') {
        return res.status(400).json({
          state: false,
          code: 400,
          msg: "請先創建繪本再添加角色",
          data: null
        });
      }
      throw bookError;
    }
    
    let characterData;
    
    if (character_id) {
      // 更新現有角色
      const { data, error } = await supabase
        .from('characters')
        .update({
          name,
          features,
          image,
          prompt,
          updated_at: new Date()
        })
        .eq('id', character_id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      characterData = data;
    } else {
      // 創建新角色
      const { data, error } = await supabase
        .from('characters')
        .insert({
          user_id: userId,
          book_id: bookData.id,
          name,
          features,
          image,
          prompt
        })
        .select()
        .single();
      
      if (error) throw error;
      characterData = data;
    }
    
    // 返回成功響應
    res.status(200).json({
      state: true,
      code: 0,
      msg: "success",
      data: {
        character_id: characterData.id,
        name: characterData.name,
        features: characterData.features,
        image: characterData.image,
        prompt: characterData.prompt
      }
    });
  } catch (error) {
    console.error('Create/Update character error:', error);
    res.status(500).json({
      state: false,
      code: 500,
      msg: error.message || "伺服器內部錯誤",
      data: null
    });
  }
};

/**
 * 取得角色資訊
 * GET /api/book/character
 */
const getCharacter = async (req, res) => {
  try {
    // 從用戶資訊中取得使用者 ID
    const userId = req.user.id;
    
    // 首先獲取使用者的繪本 ID
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();
    
    if (bookError) {
      // 如果找不到繪本，返回空結果
      if (bookError.code === 'PGRST116') {
        return res.status(200).json({
          state: true,
          code: 0,
          msg: "查無繪本資料，請先創建繪本",
          data: []
        });
      }
      throw bookError;
    }
    
    // 從資料庫中查詢角色資料
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('book_id', bookData.id)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // 格式化回應資料
    const formattedData = data.map(char => ({
      character_id: char.id,
      name: char.name,
      features: char.features,
      image: char.image,
      prompt: char.prompt
    }));
    
    // 返回成功響應
    res.status(200).json({
      state: true,
      code: 0,
      msg: "success",
      data: formattedData
    });
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({
      state: false,
      code: 500,
      msg: error.message || "伺服器內部錯誤",
      data: null
    });
  }
};

module.exports = {
  createOrUpdateCharacter,
  getCharacter
};