# 使用 Postman 測試繪本創作系統 API

本指南提供了如何使用 Postman 測試繪本創作系統 API 的詳細步驟。Postman 是一個功能強大的 API 測試工具，可以幫助您輕鬆地測試、調試和記錄 API。

## 目錄

1. [安裝 Postman](#安裝-postman)
2. [設定 Postman 集合](#設定-postman-集合)
3. [設定環境變數](#設定環境變數)
4. [測試 API 端點](#測試-api-端點)
   - [認證 API](#認證-api)
   - [繪本基本資訊 API](#繪本基本資訊-api)
   - [角色 API](#角色-api)
   - [故事段落 API](#故事段落-api)
   - [生圖提示詞 API](#生圖提示詞-api)
   - [圖片生成 API](#圖片生成-api)
   - [翻譯 API](#翻譯-api)
   - [故事分段 API](#故事分段-api)
   - [聊天機器人 API](#聊天機器人-api)
5. [自動化測試](#自動化測試)
6. [故障排除](#故障排除)

## 安裝 Postman

1. 前往 [Postman 官網](https://www.postman.com/downloads/) 下載並安裝 Postman
2. 註冊或登入 Postman 帳戶

## 設定 Postman 集合

1. 打開 Postman，點擊左側的 "Collections" 標籤
2. 點擊 "+" 按鈕創建新的集合
3. 將集合命名為 "繪本創作系統 API"
4. 點擊 "Create" 按鈕

## 設定環境變數

環境變數可以讓您更輕鬆地管理 API 端點和身份驗證令牌。

1. 點擊右上角的齒輪圖示，選擇 "Environments"
2. 點擊 "+" 按鈕創建新的環境
3. 命名環境為 "繪本 API 開發環境"
4. 添加以下變數：

| 變數名稱 | 初始值 | 說明 |
|--------|-------|------|
| `base_url` | `http://localhost:3000` | API 服務的基本 URL (本地開發) |
| `token` | (空) | 身份驗證令牌，登入後會自動設定 |

5. 對於生產環境，您可以創建另一個環境，將 `base_url` 設為 `https://your-api.onrender.com`

6. 點擊 "Save" 按鈕
7. 在 Postman 主界面右上角的下拉菜單中選擇您剛剛創建的環境

## 測試 API 端點

### 認證 API

#### 登入 (POST /api/auth/login)

1. 在您的集合中，點擊 "..." > "Add Request"
2. 命名請求為 "登入"
3. 設定請求詳情：
   - 方法: `POST`
   - URL: `{{base_url}}/api/auth/login`
   - Body 標籤: 選擇 "raw" 和 "JSON"
   - Body 內容:
     ```json
     {
       "email": "user@example.com",
       "password": "password123"
     }
     ```
4. 添加測試腳本以自動設定令牌（在 "Tests" 標籤中）：
   ```javascript
   var jsonData = pm.response.json();
   if (jsonData.state === true && jsonData.data && jsonData.data.token) {
     pm.environment.set("token", jsonData.data.token);
     console.log("令牌已設定");
   } else {
     console.log("登入失敗，未能獲取令牌");
   }
   ```
5. 點擊 "Save" 按鈕
6. 點擊 "Send" 按鈕發送請求
7. 檢查響應，確認獲得了有效的令牌

### 繪本基本資訊 API

#### 建立/更新繪本 (POST /api/book)

1. 添加新的請求，命名為 "建立/更新繪本"
2. 設定請求詳情：
   - 方法: `POST`
   - URL: `{{base_url}}/api/book`
   - Authorization 標籤: 選擇 "Bearer Token"，Token 欄位填入 `{{token}}`
   - Body 標籤: 選擇 "raw" 和 "JSON"
   - Body 內容:
     ```json
     {
       "book_name_ch": "獨角獸的奇幻森林",
       "book_name_en": "The Enchanted Forest of Unicorns",
       "style": 2,
       "book_author": "amber",
       "preface": "作者想說的話..."
     }
     ```
3. 點擊 "Save" 然後點擊 "Send"
4. 檢查響應，確認繪本創建成功

#### 取得繪本資訊 (GET /api/book)

1. 添加新的請求，命名為 "取得繪本資訊"
2. 設定請求詳情：
   - 方法: `GET`
   - URL: `{{base_url}}/api/book`
   - Authorization 標籤: 選擇 "Bearer Token"，Token 欄位填入 `{{token}}`
3. 點擊 "Save" 然後點擊 "Send"
4. 檢查響應，確認可以獲取繪本資訊

### 角色 API

#### 建立/更新角色 (POST /api/book/character)

1. 添加新的請求，命名為 "建立/更新角色"
2. 設定請求詳情：
   - 方法: `POST`
   - URL: `{{base_url}}/api/book/character`
   - Authorization 標籤: 選擇 "Bearer Token"，Token 欄位填入 `{{token}}`
   - Body 標籤: 選擇 "raw" 和 "JSON"
   - Body 內容:
     ```json
     {
       "name": "閃電",
       "features": "霓虹粉色獨角獸，眼睛是粉紅色",
       "image": "http://example.com/images/xxx.png",
       "prompt": "霓虹粉色獨角獸，名叫閃電..."
     }
     ```
3. 點擊 "Save" 然後點擊 "Send"
4. 檢查響應，記下 `character_id` 以備後用

#### 取得角色資訊 (GET /api/book/character)

1. 添加新的請求，命名為 "取得角色資訊"
2. 設定請求詳情：
   - 方法: `GET`
   - URL: `{{base_url}}/api/book/character`
   - Authorization 標籤: 選擇 "Bearer Token"，Token 欄位填入 `{{token}}`
3. 點擊 "Save" 然後點擊 "Send"
4. 檢查響應，確認返回了您創建的角色

### 故事段落 API

#### 建立/更新故事段落 (POST /api/book/data)

1. 添加新的請求，命名為 "建立/更新故事段落"
2. 設定請求詳情：
   - 方法: `POST`
   - URL: `{{base_url}}/api/book/data`
   - Authorization 標籤: 選擇 "Bearer Token"，Token 欄位填入 `{{token}}`
   - Body 標籤: 選擇 "raw" 和 "JSON"
   - Body 內容:
     ```json
     {
       "book_id": "YOUR_BOOK_ID",
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
     (記得將 `YOUR_BOOK_ID` 替換為您實際的繪本 ID)
3. 點擊 "Save" 然後點擊 "Send"
4. 檢查響應，確認故事段落已創建

#### 取得故事段落 (GET /api/book/data)

1. 添加新的請求，命名為 "取得故事段落"
2. 設定請求詳情：
   - 方法: `GET`
   - URL: `{{base_url}}/api/book/data?book_id=YOUR_BOOK_ID&page=1`
   - Authorization 標籤: 選擇 "Bearer Token"，Token 欄位填入 `{{token}}`
3. 點擊 "Save" 然後點擊 "Send"
4. 檢查響應，確認返回了該頁的故事段落

### 生圖提示詞 API

#### 生成圖像提示詞 (POST /api/book/prompt)

1. 添加新的請求，命名為 "生成圖像提示詞"
2. 設定請求詳情：
   - 方法: `POST`
   - URL: `{{base_url}}/api/book/prompt`
   - Authorization 標籤: 選擇 "Bearer Token"，Token 欄位填入 `{{token}}`
   - Body 標籤: 選擇 "raw" 和 "JSON"
   - Body 內容:
     ```json
     {
       "scene_description": "請根據以下信息生成 JSON：地點：充滿星際元素的太空背景，人物：太空貓，動作：設計了一個光束洞陷阱，用來智取潛伏的太空海盜"
     }
     ```
3. 點擊 "Save" 然後點擊 "Send"
4. 檢查響應，確認生成了合適的提示詞

### 圖片生成 API

#### 提交圖片生成任務 (POST /api/book/image)

1. 添加新的請求，命名為 "提交圖片生成任務"
2. 設定請求詳情：
   - 方法: `POST`
   - URL: `{{base_url}}/api/book/image`
   - Authorization 標籤: 選擇 "Bearer Token"，Token 欄位填入 `{{token}}`
   - Body 標籤: 選擇 "raw" 和 "JSON"
   - Body 內容:
     ```json
     {
       "story_pic_prompt": "閃電是一隻霓虹粉色獨角獸...",
       "style": "3D立體",
       "book_id": "YOUR_BOOK_ID",
       "page": 1
     }
     ```
3. 點擊 "Save" 然後點擊 "Send"
4. 檢查響應，確認生成圖像任務已提交

### 翻譯 API

#### 翻譯文本 (POST /api/translate)

1. 添加新的請求，命名為 "翻譯文本"
2. 設定請求詳情：
   - 方法: `POST`
   - URL: `{{base_url}}/api/translate`
   - Authorization 標籤: 選擇 "Bearer Token"，Token 欄位填入 `{{token}}`
   - Body 標籤: 選擇 "raw" 和 "JSON"
   - Body 內容:
     ```json
     {
       "input_text": "在一片神秘花園中，閃電發現了一張神奇地圖。"
     }
     ```
3. 點擊 "Save" 然後點擊 "Send"
4. 檢查響應，確認返回了正確的翻譯

### 故事分段 API

#### 故事分段分析 (POST /api/book/story-segmentation)

1. 添加新的請求，命名為 "故事分段分析"
2. 設定請求詳情：
   - 方法: `POST`
   - URL: `{{base_url}}/api/book/story-segmentation`
   - Authorization 標籤: 選擇 "Bearer Token"，Token 欄位填入 `{{token}}`
   - Body 標籤: 選擇 "raw" 和 "JSON"
   - Body 內容:
     ```json
     {
       "story_segment": "閃電在大雨中邂逅了一只藍色的小龍，它們快速成為了好朋友。"
     }
     ```
3. 點擊 "Save" 然後點擊 "Send"
4. 檢查響應，確認返回了 who/where/what 組件

### 聊天機器人 API

#### 開始對話 (POST /api/chat)

1. 添加新的請求，命名為 "開始對話"
2. 設定請求詳情：
   - 方法: `POST`
   - URL: `{{base_url}}/api/chat`
   - Authorization 標籤: 選擇 "Bearer Token"，Token 欄位填入 `{{token}}`
   - Body 標籤: 選擇 "raw" 和 "JSON"
   - Body 內容:
     ```json
     {
       "currentMode": "title-creation",
       "userMessage": "我想要一個關於太空冒險的故事"
     }
     ```
3. 點擊 "Save" 然後點擊 "Send"
4. 檢查響應，記下 `conversationId` 以備後用

#### 繼續對話 (POST /api/chat)

1. 添加新的請求，命名為 "繼續對話"
2. 設定請求詳情：
   - 方法: `POST`
   - URL: `{{base_url}}/api/chat`
   - Authorization 標籤: 選擇 "Bearer Token"，Token 欄位填入 `{{token}}`
   - Body 標籤: 選擇 "raw" 和 "JSON"
   - Body 內容:
     ```json
     {
       "currentMode": "title-creation",
       "userMessage": "我希望故事的主角是一隻勇敢的小貓",
       "conversationId": "YOUR_CONVERSATION_ID"
     }
     ```
     (記得將 `YOUR_CONVERSATION_ID` 替換為上一個對話中獲得的 ID)
3. 點擊 "Save" 然後點擊 "Send"
4. 檢查響應，確認對話正常進行

## 自動化測試

您可以使用 Postman 的 Collection Runner 自動化測試多個請求：

1. 點擊集合右側的 "..." > "Run collection"
2. 選擇需要運行的請求和重複次數
3. 點擊 "Run" 按鈕
4. 查看測試報告，確認所有請求都成功

## 故障排除

### 常見問題及解決方案

1. **身份驗證失敗**
   - 確認使用了正確的帳號和密碼
   - 檢查 JWT 令牌是否已過期
   - 確認令牌已正確設置在請求的 Authorization 標籤中

2. **找不到資源**
   - 確認使用了正確的 ID (如 book_id, character_id)
   - 檢查資源是否屬於當前登入的用戶

3. **請求格式錯誤**
   - 確認 JSON 格式正確
   - 檢查是否提供了所有必要的欄位
   - 確認使用了正確的 HTTP 方法

### 接口錯誤碼解釋

| 錯誤碼 | 說明 |
|-------|-----|
| 400 | 請求參數錯誤或缺少必要參數 |
| 401 | 未提供身份驗證令牌 |
| 403 | 令牌無效或已過期 |
| 404 | 找不到請求的資源 |
| 500 | 服務器內部錯誤 |

## 附錄：搭建本地服務器

若要在本地測試 API，請按照以下步驟設置開發環境：

1. 克隆專案代碼庫
2. 安裝依賴：`npm install`
3. 創建 `.env` 文件並設置必要的環境變數
4. 啟動開發服務器：`npm run dev`
5. 使用 Postman 測試 API (基本 URL 為 `http://localhost:3000`)

---

通過按照本指南測試 API，您可以確保繪本創作系統的所有功能都能正常工作，並能更好地理解 API 的工作方式。