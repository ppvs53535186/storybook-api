/**
 * 聊天機器人控制器
 * 處理聊天機器人對話生成和對話記錄
 */
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const crypto = require('crypto');

dotenv.config();

// 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key'
});

// 如果沒有 API Key，使用模擬回應
const isDevelopment = process.env.NODE_ENV !== 'production';
const mockResponses = {
  'title-creation': {
    start: {
      message: "你好！我們來一起創造一個繪本的標題吧！你想要什麼主題的繪本？",
      options: ["冒險故事", "奇幻世界", "友誼", "我要自己寫"]
    },
    final: {
      message: "根據我們的對話，我想到一個繪本標題：「神奇森林大冒險」，你覺得怎麼樣？",
      title: "神奇森林大冒險",
      options: ["我喜歡", "再幫我調整一下", "我要自己寫"],
      isFinished: true
    }
  },
  'character-creation': {
    start: {
      message: "讓我們來創造繪本的主角吧！你想要什麼樣的角色？",
      options: ["勇敢的小孩", "可愛的動物", "神秘的精靈", "我要自己寫"]
    },
    final: {
      message: "我幫你整理出角色囉，看看喜不喜歡？主角叫『帥帥』、特徵有『身穿銀色太空裝，戴鋼鐵頭盔』",
      name: "帥帥",
      features: "身穿銀色太空裝，戴鋼鐵頭盔",
      options: ["我完成了這一頁", "再幫我調整一下"],
      isFinished: true
    }
  },
  'story-content': {
    start: {
      message: "讓我們來創造故事內容吧！這一頁你想要講什麼呢？",
      options: ["主角的冒險開始", "遇到困難", "解決問題", "我要自己寫"]
    },
    final: {
      message: "根據我們的對話，這一頁的故事內容是：「帥帥被突如其來的彗星風暴困住！他該如何脫困？」，你覺得怎麼樣？",
      content: "帥帥被突如其來的彗星風暴困住！他該如何脫困？",
      options: ["我完成了這一頁", "再幫我調整一下", "我要自己寫"],
      isFinished: true
    }
  },
  'default': {
    start: {
      message: "歡迎使用繪本創作系統！我可以幫你創作繪本的標題、角色和故事內容。你想要開始哪一部分呢？",
      options: ["創作標題", "設計角色", "撰寫故事", "我想聊聊其他的"]
    }
  }
};

/**
 * 生成系統提示詞
 * @param {string} mode - 對話模式
 * @param {object} context - 上下文信息 (如故事信息、頁數等)
 * @returns {string} 系統提示詞
 */
const generateSystemPrompt = (mode, context = {}) => {
  const basePrompt = `你是一個專業的兒童繪本創作助手。你的任務是透過對話引導使用者完成繪本創作。
使用繁體中文回覆。保持友善、鼓勵的語氣，適合與小朋友交流。
每次回覆必須包含一個主要訊息和 2-4 個建議選項供使用者選擇。
訊息簡潔明瞭，不超過 35 個字。不使用任何 Markdown 格式。`;

  let modePrompt = '';
  
  switch(mode) {
    case 'title-creation':
      modePrompt = `你正在協助使用者創作繪本標題。
引導使用者思考繪本的主題、風格和核心元素。
當使用者提供足夠信息後，幫助其確定一個吸引人的標題，不超過 10-15 個字。
當最終確定標題時，回覆中需要包含 "title" 字段，並將 "isFinished" 設為 true。`;
      break;
      
    case 'character-creation':
      modePrompt = `你正在協助使用者設計繪本角色。
引導使用者思考角色的名稱、外觀特徵和個性特點。
名稱應簡短有趣，不超過 10 個字；特徵描述應具體形象，不超過 25 個字。
當最終確定角色設定時，回覆中需要包含 "name" 和 "features" 字段，並將 "isFinished" 設為 true。`;
      break;
      
    case 'story-content':
      modePrompt = `你正在協助使用者撰寫繪本第 ${context.storyPage || 1} 頁的內容。
引導使用者思考這一頁想要表達的情節、場景和情感。
故事內容應簡潔生動，適合朗讀，不超過 30 個字。
當最終確定內容時，回覆中需要包含 "content" 字段，並將 "isFinished" 設為 true。`;
      break;
      
    default:
      modePrompt = `你正在進行一般對話，了解使用者的需求，並引導他們進入特定的創作模式。
介紹你可以幫助的三個主要領域：創作標題、設計角色和撰寫故事內容。
根據使用者的回應，建議他們選擇最適合的創作模式。`;
  }
  
  // 如果有繪本 ID，嘗試獲取之前的創作信息加入上下文
  if (context.storyId) {
    modePrompt += `\n\n參考資訊：這是ID為 ${context.storyId} 的繪本。`;
  }
  
  return basePrompt + '\n\n' + modePrompt;
};

/**
 * 獲取對話歷史記錄
 * @param {string} conversationId - 對話 ID
 * @param {string} userId - 用戶 ID
 * @returns {Promise<Array>} 對話歷史記錄
 */
const getConversationHistory = async (conversationId, userId) => {
  if (!conversationId) return [];
  
  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('messages')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data?.messages || [];
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }
};

/**
 * 儲存對話歷史記錄
 * @param {string} conversationId - 對話 ID
 * @param {string} userId - 用戶 ID
 * @param {Array} messages - 對話訊息
 * @param {string} mode - 對話模式
 * @returns {Promise<void>}
 */
const saveConversationHistory = async (conversationId, userId, messages, mode) => {
  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .upsert({
        id: conversationId,
        user_id: userId,
        mode,
        messages,
        updated_at: new Date()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving conversation history:', error);
  }
};

/**
 * 解析 AI 回應
 * @param {string} aiResponse - AI 回應文字
 * @returns {object} 解析後的回應對象
 */
const parseAIResponse = (aiResponse) => {
  try {
    // 嘗試解析 JSON 字符串回應
    if (aiResponse.includes('{') && aiResponse.includes('}')) {
      const jsonStartPos = aiResponse.indexOf('{');
      const jsonEndPos = aiResponse.lastIndexOf('}') + 1;
      const jsonStr = aiResponse.substring(jsonStartPos, jsonEndPos);
      return JSON.parse(jsonStr);
    } 
    
    // 如果不是 JSON 格式，給出默認回應
    return {
      message: aiResponse.substring(0, 100),
      options: ["好的", "繼續", "我想嘗試別的"]
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      message: "抱歉，我無法理解這個回應。讓我們重新開始吧！",
      options: ["好的", "換個話題", "提供幫助"]
    };
  }
};

/**
 * 創建對話 ID
 * @param {string} userId - 用戶 ID
 * @returns {string} 對話 ID
 */
const createConversationId = (userId) => {
  const timestamp = Date.now().toString();
  const randomStr = crypto.randomBytes(8).toString('hex');
  return `conv_${userId.substring(0, 8)}_${timestamp.substring(timestamp.length - 6)}_${randomStr}`;
};

/**
 * 聊天機器人對話
 * POST /api/chat
 */
const chat = async (req, res) => {
  try {
    const { 
      currentMode, 
      storyId, 
      storyPage, 
      userMessage, 
      conversationId: providedConversationId, 
      conversationHistory 
    } = req.body;
    
    // 檢查必要參數
    if (!currentMode || !userMessage) {
      return res.status(400).json({
        state: false,
        code: 400,
        msg: "缺少必要參數: currentMode 或 userMessage",
        data: null
      });
    }
    
    // 獲取用戶 ID
    const userId = req.user.id;
    
    // 確認對話 ID，如果沒有提供則創建新的
    const conversationId = providedConversationId || createConversationId(userId);
    
    // 獲取對話歷史
    let messages = [];
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // 使用前端提供的對話歷史
      messages = conversationHistory;
    } else {
      // 從數據庫獲取對話歷史
      messages = await getConversationHistory(conversationId, userId);
    }
    
    // 生成系統提示詞
    const systemPrompt = generateSystemPrompt(currentMode, { storyId, storyPage });
    
    // 準備 AI 對話訊息
    let aiMessages = [
      { role: "system", content: systemPrompt }
    ];
    
    // 如果有現有對話，加入歷史訊息
    if (messages.length > 0) {
      aiMessages = [...aiMessages, ...messages];
    }
    
    // 加入用戶當前輸入
    aiMessages.push({ role: "user", content: userMessage });
    
    let aiResponse;
    let parsedResponse;
    
    // 判斷是否在開發模式使用模擬回應
    if (isDevelopment && !process.env.OPENAI_API_KEY) {
      console.log('使用模擬回應模式');
      
      // 使用模擬回應
      if (messages.length === 0) {
        // 第一次對話，使用開始回應
        parsedResponse = mockResponses[currentMode]?.start || mockResponses.default.start;
      } else if (userMessage.includes('完成') || messages.length > 3) {
        // 完成對話，使用最終回應
        parsedResponse = mockResponses[currentMode]?.final || {
          message: "很好！我們已經完成了這個部分。",
          options: ["繼續下一步", "回到主選單"],
          isFinished: true
        };
      } else {
        // 進行中的對話
        parsedResponse = {
          message: `關於「${userMessage.substring(0, 15)}...」這個想法很棒！還有什麼細節想要補充嗎？`,
          options: ["增加更多細節", "換個方向", "可以幫我總結一下嗎"],
          isFinished: false
        };
      }
    } else {
      // 使用 OpenAI API
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-0125",
          messages: aiMessages,
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: "json_object" }
        });
        
        aiResponse = completion.choices[0].message.content;
        parsedResponse = parseAIResponse(aiResponse);
        
        // 將 AI 回應加入對話歷史
        messages.push({ role: "user", content: userMessage });
        messages.push({ role: "assistant", content: aiResponse });
        
        // 儲存對話歷史
        await saveConversationHistory(conversationId, userId, messages, currentMode);
      } catch (error) {
        console.error('OpenAI API error:', error);
        
        // 在 API 錯誤時使用備用回應
        parsedResponse = {
          message: "抱歉，我現在無法生成回應。請稍後再試。",
          options: ["重新開始", "換個話題", "聯繫支援"],
          error: error.message
        };
      }
    }
    
    // 處理最終回應
    const finalResponse = {
      message: parsedResponse.message,
      options: parsedResponse.options || ["繼續", "重新開始", "結束"],
      isFinished: !!parsedResponse.isFinished,
      conversationId: conversationId,
      error: parsedResponse.error || null
    };
    
    // 根據不同模式添加額外字段
    if (currentMode === 'title-creation' && parsedResponse.title) {
      finalResponse.title = parsedResponse.title;
    } else if (currentMode === 'character-creation' && parsedResponse.name && parsedResponse.features) {
      finalResponse.name = parsedResponse.name;
      finalResponse.features = parsedResponse.features;
    } else if (currentMode === 'story-content' && parsedResponse.content) {
      finalResponse.content = parsedResponse.content;
    }
    
    // 返回成功響應
    res.status(200).json(finalResponse);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      message: "發生錯誤，無法完成對話",
      options: ["重新開始", "嘗試別的功能"],
      isFinished: false,
      error: error.message || "伺服器內部錯誤",
      conversationId: req.body.conversationId || null
    });
  }
};

module.exports = {
  chat
};