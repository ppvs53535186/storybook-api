# 繪本創作系統 API

這是一個為數位繪本創作系統設計的 RESTful API 服務。該系統允許用戶建立自己的數位繪本，包括定義角色、場景，並透過 AI 技術生成相關圖片。

## 功能特點

- 會員認證和授權
- 繪本基本資訊管理
- 角色資訊管理
- 故事內容創建和編輯
- AI 圖像生成提示詞產生
- 圖像生成功能
- 中英文翻譯
- 故事內容分析
- AI 聊天機器人輔助創作

## 安裝

1. 克隆此專案
```
git clone https://github.com/yourusername/storybook-api.git
cd storybook-api
```

2. 安裝依賴
```
npm install
```

3. 設定環境變數
```
cp .env.example .env
```
然後編輯 `.env` 檔案，填入相應的配置值。

4. 啟動開發伺服器
```
npm run dev
```

## API 文檔

### API 測試

參考 [使用 Postman 測試 API](README-postman.md) 獲取詳細的 API 測試指南。

### 1. 繪本基本資訊

#### 1.1 建立/更新繪本 (POST /api/book)
建立或更新繪本的基本資訊。

**請求體範例：**
```json
{
  "book_name_ch": "獨角獸的奇幻森林",
  "book_name_en": "The Enchanted Forest of Unicorns",
  "style": 2,
  "book_author": "amber",
  "preface": "作者想說的話..."
}
```

**回應範例：**
```json
{
  "state": true,
  "code": 0,
  "msg": "success",
  "data": {
    "book_id": 744,
    "book_name_ch": "獨角獸的奇幻森林",
    "book_name_en": "The Enchanted Forest of Unicorns",
    "style": 2,
    "book_author": "amber",
    "preface": "作者想說的話...",
    "book_frontcover": "http://example.com/images/xxx.png",
    "book_backcover": "http://example.com/images/xxx.png"
  }
}
```

#### 1.2 取得繪本 (GET /api/book)
取得目前用戶的繪本資訊。

**回應範例：**
```json
{
  "state": true,
  "code": 0,
  "msg": "success",
  "data": {
    "book_id": 744,
    "book_name_ch": "獨角獸的奇幻森林",
    "book_name_en": "The Enchanted Forest of Unicorns",
    "style": 2,
    "book_frontcover": "http://example.com/images/xxx.png",
    "book_backcover": "http://example.com/images/xxx.png",
    "preface": "作者想說的話...",
    "book_author": "amber"
  }
}
```

### 2. 繪本角色

#### 2.1 建立/更新角色 (POST /api/book/character)
建立或更新繪本中的角色資訊。

**請求體範例：**
```json
{
  "name": "閃電",
  "features": "霓虹粉色獨角獸，眼睛是粉紅色",
  "image": "http://example.com/images/xxx.png",
  "prompt": "霓虹粉色獨角獸，名叫閃電..."
}
```

**回應範例：**
```json
{
  "state": true,
  "code": 0,
  "msg": "success",
  "data": {
    "character_id": 123,
    "name": "閃電",
    "features": "霓虹粉色獨角獸，眼睛是粉紅色",
    "image": "http://example.com/images/xxx.png",
    "prompt": "霓虹粉色獨角獸，名叫閃電..."
  }
}
```

#### 2.2 取得角色資訊 (GET /api/book/character)
取得繪本中的角色資訊。

**回應範例：**
```json
{
  "state": true,
  "code": 0,
  "msg": "success",
  "data": [
    {
      "character_id": 123,
      "name": "閃電",
      "features": "霓虹粉色獨角獸，眼睛是粉紅色",
      "image": "http://example.com/images/xxx.png",
      "prompt": "霓虹粉色獨角獸，名叫閃電..."
    }
  ]
}
```

### 3. 繪本故事內容

#### 3.1 建立/更新故事段落 (POST /api/book/data)
建立或更新繪本中每一頁的故事內容。

**請求體範例：**
```json
{
  "book_id": 744,
  "page": 1,
  "user_input": "在一片神秘花園中，閃電發現了一張神奇地圖。",
  "en_user_input": "In a mysterious garden, Lightning discovered a magical map.",
  "position_input": "bottom-right",
  "user_pic_select": "http://example.com/images/xxx.png",
  "user_pic_input": [
    {"who": "閃電"},
    {"where": "很多玫瑰花的神秘花園"},
    {"what": "發現了一張神奇地圖"}
  ]
}
```

**回應範例：**
```json
{
  "state": true,
  "code": 0,
  "msg": "success",
  "data": {
    "user_pic_select": "http://example.com/images/xxx.png",
    "position_input": "bottom-right",
    "user_input": "在一片神秘花園中，閃電發現了一張神奇地圖。",
    "en_user_input": "In a mysterious garden, Lightning discovered a magical map.",
    "pic_generated": 1,
    "story_pic_ai": [
      "http://example.com/images/xxx.png",
      "http://example.com/images/xxx.png"
    ],
    "user_pic_input": [
      {"who": "閃電"},
      {"where": "很多玫瑰花的神秘花園"},
      {"what": "發現了一張神奇地圖"}
    ]
  }
}
```

#### 3.2 取得故事段落 (GET /api/book/data)
取得指定繪本和頁碼的故事內容。

**請求參數：**
- book_id: 繪本 ID
- page: 頁碼

**請求範例：**
```
GET /api/book/data?book_id=744&page=1
```

**回應範例：**
```json
{
  "state": true,
  "code": 0,
  "msg": "success",
  "data": {
    "user_pic_select": "http://47.245.15.26/images/2025-03-18/67d939cd420fc-6977.png",
    "position_input": "bottom-right",
    "user_input": "在一片神秘花園中，閃電發現了一張神奇地圖。",
    "en_user_input": "In a mysterious garden, Lightning discovered a magical map.",
    "pic_generated": 1,
    "story_pic_ai": [
      "http://example.com/images/xxx.png",
      "http://example.com/images/xxx.png"
    ],
    "user_pic_input": [
      {"who": "閃電"},
      {"where": "很多玫瑰花的神秘花園"},
      {"what": "發現了一張神奇地圖"}
    ]
  }
}
```

### 4. 生成生圖所需的 Prompt

#### 4.1 生成圖像提示詞 (POST /api/book/prompt)
根據場景描述生成 AI 圖像生成所需的提示詞。

**請求體範例：**
```json
{
  "scene_description": "請根據以下信息生成 JSON：地點：充滿星際元素的太空背景，人物：太空貓，動作：設計了一個光束洞陷阱，用來智取潛伏的太空海盜"
}
```

**回應範例：**
```json
{
  "state": true,
  "code": 0,
  "msg": "success",
  "data": {
    "action_background": "在一個充滿星際元素的太空背景中，太空貓正在專注地設計一個光束洞陷阱，以智取潛伏的太空海盜。背景是遼闊的宇宙空間，點綴著閃爍的星星和遙遠的星系。",
    "character_features": "太空貓，擁有閃亮的銀色毛皮與明亮的藍色眼睛，穿著高科技太空裝，攜帶工具包，神情專注地觀察著準備製作的陷阱。"
  }
}
```

### 5. 生成圖片

#### 5.1 提交圖片生成任務 (POST /api/book/image)
提交圖片生成任務，使用 AI 生成圖像。

**請求體範例：**
```json
{
  "story_pic_prompt": "閃電是一隻霓虹粉色獨角獸...",
  "style": "3D立體",
  "book_id": 744,
  "page": 1
}
```

**回應範例：**
```json
{
  "state": true,
  "code": 0,
  "msg": "success",
  "data": {
    "image_urls": [
      "http://example.com/images/xxx.png",
      "http://example.com/images/xxx.png"
    ]
  }
}
```

### 6. 中翻英

#### 6.1 翻譯 API (POST /api/translate)
將中文文本翻譯成英文。

**請求體範例：**
```json
{
  "input_text": "在一片神秘花園中，閃電發現了一張神奇地圖。"
}
```

**回應範例：**
```json
{
  "state": true,
  "code": 0,
  "msg": "success",
  "data": {
    "translated_text": "In a mysterious garden, Lightning discovered a magical map."
  }
}
```

### 7. 依據故事自動生成「who / where / what」

#### 7.1 故事分段 (POST /api/book/story-segmentation)
分析故事片段，產出角色、場景、行為描述。

**請求體範例：**
```json
{
  "story_segment": "閃電在大雨中邂逅了一只藍色的小龍，它們快速成為了好朋友。"
}
```

**回應範例：**
```json
{
  "state": true,
  "code": 0,
  "msg": "success",
  "data": {
    "who": "霓虹粉色獨角獸閃電、藍色小龍",
    "where": "傾盆大雨的森林或山谷",
    "what": "在大雨中相遇並成為朋友"
  }
}
```

### 8. 聊天機器人 API

#### 8.1 聊天機器人 (POST /api/chat)
與聊天機器人互動，根據不同模式引導用戶完成繪本創作。

**請求體範例：**
```json
{
  "currentMode": "title-creation",
  "storyId": "123",
  "storyPage": 2,
  "userMessage": "我想要一個關於太空冒險的故事",
  "conversationId": "abc-123-xyz",
  "conversationHistory": [
    { "role": "user", "content": "我想創作一個繪本" },
    { "role": "assistant", "content": "{ \"message\": \"好的，想要什麼主題呢？\", \"options\": [\"冒險\",\"友誼\",\"自然\",\"我要自己寫\"] }" }
  ]
}
```

**回應範例 (一般對話)：**
```json
{
  "message": "太空冒險聽起來超酷的！想要什麼樣的主角呢？",
  "options": ["勇敢的小孩", "機器人", "外星生物", "我要自己寫"],
  "isFinished": false,
  "conversationId": "abc-123-xyz",
  "error": null
}
```

**回應範例 (標題生成)：**
```json
{
  "message": "根據我們的對話，我想到一個繪本標題：「星際探險隊出發」，你覺得怎麼樣？",
  "title": "星際探險隊出發",
  "options": ["我完成了這一頁", "再幫我調整一下", "我要自己寫"],
  "isFinished": true,
  "conversationId": "abc-123-xyz",
  "error": null
}
```

**回應範例 (角色生成)：**
```json
{
  "message": "我幫你整理出角色囉，看看喜不喜歡？主角叫『小宇』、特徵有『戴著星星頭盔的勇敢太空人』",
  "name": "小宇",
  "features": "戴著星星頭盔的勇敢太空人",
  "options": ["我完成了這一頁", "再幫我調整一下"],
  "isFinished": true,
  "conversationId": "abc-123-xyz",
  "error": null
}
```

**回應範例 (故事內容生成)：**
```json
{
  "message": "根據我們的對話，這一頁的故事內容是：「小宇駕駛著火箭，飛向未知的星球探險！」，你覺得怎麼樣？",
  "content": "小宇駕駛著火箭，飛向未知的星球探險！",
  "options": ["我完成了這一頁", "再幫我調整一下", "我要自己寫"],
  "isFinished": true,
  "conversationId": "abc-123-xyz",
  "error": null
}
```

## 錯誤處理

所有 API 在發生錯誤時都會返回包含狀態碼和錯誤訊息的 JSON 響應。

**錯誤響應範例：**
```json
{
  "state": false,
  "code": 400,
  "msg": "缺少必要參數",
  "data": null
}
```

## 授權與認證

所有 API 端點都需要在請求標頭中包含認證 Token。

**認證標頭範例：**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

如果未提供有效的 Token，API 將返回 401 或 403 狀態碼的錯誤響應。

## 開發者資訊

### 可用的帳號

系統目前設定了兩組測試帳號：

1. 信箱: `user@example.com`, 密碼: `password123`
2. 信箱: `test@example.com`, 密碼: `12345678`

這些帳號僅用於開發測試，實際生產環境應使用資料庫進行使用者驗證。