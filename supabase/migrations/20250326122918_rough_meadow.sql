/*
  # 添加聊天對話相關表格

  1. 新表格
    - `chat_conversations`：存儲用戶與 AI 助手的對話記錄
      - `id` (text, 主鍵): 對話唯一標識符
      - `user_id` (uuid): 關聯到用戶
      - `mode` (text): 對話模式 (title-creation, character-creation, story-content, default)
      - `messages` (jsonb): 存儲完整對話記錄
      - `metadata` (jsonb): 額外的元數據，如相關聯的繪本ID、頁碼等
      - `created_at` (timestamptz): 創建時間
      - `updated_at` (timestamptz): 更新時間
  
  2. 安全
    - 啟用 RLS 於 `chat_conversations` 表格
    - 添加政策確保用戶只能訪問自己的對話記錄
*/

-- 創建聊天對話記錄表
CREATE TABLE IF NOT EXISTS chat_conversations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  mode TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 添加索引以優化查詢性能
CREATE INDEX IF NOT EXISTS chat_conversations_user_id_idx ON chat_conversations (user_id);
CREATE INDEX IF NOT EXISTS chat_conversations_mode_idx ON chat_conversations (mode);

-- 啟用行級安全性
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- 創建安全性策略
CREATE POLICY "使用者可以查看自己的對話記錄" ON chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "使用者可以創建自己的對話記錄" ON chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "使用者可以更新自己的對話記錄" ON chat_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "使用者可以刪除自己的對話記錄" ON chat_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- 添加觸發器自動更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON chat_conversations;

CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON chat_conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();