# 繪本創作系統部署指南：Render.com 與 Supabase

本文檔提供了將繪本創作系統 API 部署到 Render.com 並與 Supabase 整合的完整指南。

## 目錄

1. [前置準備](#前置準備)
2. [Supabase 設定](#supabase-設定)
3. [Render.com 部署](#rendercom-部署)
4. [環境變數設定](#環境變數設定)
5. [測試部署](#測試部署)
6. [問題排除](#問題排除)
7. [維護與更新](#維護與更新)
8. [安全性最佳實踐](#安全性最佳實踐)

## 前置準備

在開始部署前，請確保您已經準備好以下項目：

- [Supabase](https://supabase.com/) 帳號
- [Render.com](https://render.com/) 帳號
- 您的專案代碼已經上傳到 GitHub 或 GitLab 儲存庫
- OpenAI API 金鑰（如果您的應用使用 OpenAI 服務）

## Supabase 設定

### 步驟 1: 創建 Supabase 專案

1. 登入 [Supabase](https://app.supabase.com/)
2. 點擊 "New Project"
3. 輸入專案名稱（如 "storybook-api"）
4. 選擇最近的地區（如亞洲用戶可選擇 "Asia Northeast (Tokyo)"）
5. 設定資料庫密碼（請使用強密碼並妥善保存）
6. 點擊 "Create new project"

### 步驟 2: 設定資料庫架構

專案建立完成後，可以使用兩種方式設定資料庫架構：

#### 方法 1: 使用 SQL 編輯器手動執行遷移腳本

1. 在 Supabase 儀表板中，點擊左側導航欄中的 "SQL Editor"
2. 點擊 "New Query"
3. 複製 `supabase/migrations` 目錄中的 SQL 腳本內容
4. 粘貼到 SQL 編輯器中
5. 點擊 "Run" 執行腳本

注意：如果遇到錯誤（例如政策已存在），請修改 SQL 語句以使用 `IF NOT EXISTS` 條件，如以下示例：

```sql
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = '使用者可以查看自己的對話記錄'
  ) THEN
    CREATE POLICY "使用者可以查看自己的對話記錄" ON chat_conversations
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;
```

#### 方法 2: 使用 Supabase CLI（需要本地開發環境）

1. 安裝 Supabase CLI：
   ```
   npm install -g supabase
   ```

2. 登入您的 Supabase 帳號：
   ```
   supabase login
   ```

3. 鏈接您的專案：
   ```
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (您可以在 Supabase 專案設定中找到 project-ref)

4. 推送遷移文件：
   ```
   supabase db push
   ```

### 步驟 3: 設定身份驗證

1. 在 Supabase 儀表板，點擊左側導航欄中的 "Authentication"
2. 在 "Providers" 頁面，確保 "Email" 驗證已啟用
3. 如果需要停用電子郵件確認功能，取消勾選 "Confirm email"
4. 點擊 "Save"

### 步驟 4: 取得連接資訊

1. 在 Supabase 儀表板，點擊左側導航欄中的 "Project Settings"
2. 點擊 "API"
3. 記下以下信息（將用於設定環境變數）：
   - API URL (`https://YOUR_PROJECT_ID.supabase.co`)
   - `anon` key
   - `service_role` key（注意：這個密鑰有完整的資料庫權限，請謹慎保管）

## Render.com 部署

### 步驟 1: 創建新的 Web Service

1. 登入 [Render.com](https://dashboard.render.com/)
2. 點擊 "New" > "Web Service"
3. 連接您的 GitHub/GitLab 帳號並選擇您的專案儲存庫
4. 填寫服務信息：
   - 名稱：如 "storybook-api"
   - 環境：Node
   - 區域：選擇最近的地區
   - 分支：通常為 `main` 或 `master`
   - 構建命令：`npm install`
   - 啟動命令：`node server.js`
5. 選擇計劃價格（免費計劃適合開發和測試）
6. 點擊 "Create Web Service"

### 步驟 2: 設定環境變數

1. 在您的服務頁面，點擊 "Environment"
2. 點擊 "Add Environment Variable"
3. 添加以下環境變數：
   - `PORT`: `10000`（Render 會自動設定正確的埠口）
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: 一個隨機生成的強密鑰（可以使用密鑰生成器生成）
   - `OPENAI_API_KEY`: 您的 OpenAI API 金鑰
   - `SUPABASE_URL`: 您的 Supabase API URL
   - `SUPABASE_ANON_KEY`: 您的 Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: 您的 Supabase service role key
4. 點擊 "Save Changes"

### 步驟 3: 設定自動部署

1. 在 "Settings" 頁面，確認 "Auto Deploy" 已啟用
2. 這樣每當您推送新代碼到儲存庫時，Render 會自動重新部署您的服務

## 環境變數設定

以下是您需要設定的所有環境變數的詳細說明：

| 環境變數 | 描述 | 如何獲取/生成 |
|---------|------|--------------|
| `PORT` | 應用程序運行的端口 | 設為 `10000`（Render 會自動處理） |
| `NODE_ENV` | 應用程序環境 | 設為 `production` |
| `JWT_SECRET` | 用於簽署 JWT 令牌的密鑰 | 生成一個安全的隨機字串 |
| `OPENAI_API_KEY` | OpenAI API 的訪問金鑰 | 從 [OpenAI 儀表板](https://platform.openai.com/api-keys) 獲取 |
| `SUPABASE_URL` | Supabase 實例的 URL | 從 Supabase 專案設定 > API 獲取 |
| `SUPABASE_ANON_KEY` | Supabase 匿名訪問金鑰 | 從 Supabase 專案設定 > API 獲取 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服務角色金鑰 | 從 Supabase 專案設定 > API 獲取 |

## 測試部署

部署完成後，您可以通過以下步驟測試您的 API：

1. 訪問您的 API 健康檢查端點：
   ```
   https://your-service-name.onrender.com/health
   ```
   
   您應該看到類似以下的回應：
   ```json
   {
     "state": true,
     "message": "API 服務正常運行"
   }
   ```

2. 使用 Postman 或其他 API 測試工具測試其他端點
   - 先測試 `/api/auth/login` 端點獲取 JWT 令牌
   - 然後使用該令牌測試其他受保護的端點

## 問題排除

### Supabase 問題

1. **策略創建錯誤**：如果遇到 "policy already exists" 錯誤，請使用條件語句如本文檔前面所示。

2. **連接問題**：確保環境變數正確設定。可以通過以下方式測試連接：
   ```javascript
   const { data, error } = await supabase.from('books').select('count').single();
   console.log('Connection test:', { data, error });
   ```

3. **身份驗證問題**：檢查 RLS 政策是否正確設定，確保 `auth.uid()` 匹配用戶 ID。

### Render.com 問題

1. **構建失敗**：檢查構建日誌以尋找錯誤。通常這與依賴項或 Node.js 版本有關。

2. **應用啟動失敗**：檢查應用日誌以查看錯誤消息。您可以從 Render 儀表板訪問日誌。

3. **環境變數問題**：確保所有必要的環境變數都已正確設定。

## 維護與更新

### 更新應用程序

1. 將更改推送到您的 Git 儲存庫
2. Render 會自動檢測更改並重新部署

### 數據庫遷移

當需要更新數據庫架構時：

1. 在 `supabase/migrations` 目錄中創建新的遷移文件
2. 使用 SQL 編輯器或 Supabase CLI 執行遷移
3. 測試遷移是否成功

### 監控

1. 使用 Render 儀表板監控應用程序性能和日誌
2. 考慮設置警報以在出現問題時通知您

## 安全性最佳實踐

1. **環境變數**：
   - 不要在代碼庫中硬編碼敏感信息
   - 定期更換 JWT 密鑰和 API 金鑰

2. **數據庫安全**：
   - 確保所有表格都啟用了 RLS
   - 遵循最小權限原則設計 RLS 政策
   - 定期審查權限和政策

3. **API 安全**：
   - 使用 HTTPS
   - 設定適當的 CORS 策略
   - 實施速率限制以防止濫用

4. **監控和日誌**：
   - 定期檢查應用程序日誌
   - 監控可疑活動

---

## 附錄：有用的命令和腳本

### 生成安全的 JWT 密鑰

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 檢查 Supabase 連接

```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testConnection() {
  const { data, error } = await supabase.from('books').select('count').single();
  console.log('Connection test:', { data, error });
}

testConnection();
```

### 更新時間觸發器

以下是一個為表格添加自動更新時間戳的 SQL 腳本：

```sql
-- 創建觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 為表格添加觸發器
CREATE TRIGGER update_TABLE_NAME_updated_at
BEFORE UPDATE ON TABLE_NAME
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

將 `TABLE_NAME` 替換為您的表格名稱。

---

這個部署指南提供了將繪本創作系統 API 部署到 Render.com 和 Supabase 的完整過程。按照這些步驟，您將能夠設置一個穩定、安全且可維護的生產環境。如果您有任何問題或需要進一步的幫助，請參考 [Render 文檔](https://render.com/docs) 和 [Supabase 文檔](https://supabase.com/docs)。