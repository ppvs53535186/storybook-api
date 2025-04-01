/*
  # 修正繪本創作系統資料庫結構

  1. 安全地建立或更新結構
    - 檢查表格是否存在再創建
    - 檢查政策是否存在再創建
    - 避免重複操作導致錯誤
*/

-- 安全地創建聊天對話記錄表
CREATE TABLE IF NOT EXISTS chat_conversations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  mode TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 只有在索引不存在時才創建索引
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'chat_conversations_user_id_idx'
  ) THEN
    CREATE INDEX chat_conversations_user_id_idx ON chat_conversations (user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'chat_conversations_mode_idx'
  ) THEN
    CREATE INDEX chat_conversations_mode_idx ON chat_conversations (mode);
  END IF;
END $$;

-- 啟用行級安全性 (如果尚未啟用)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE tablename = 'chat_conversations' AND rowsecurity = true
  ) THEN
    ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 安全地創建政策 (只有在不存在時才創建)
DO $$ 
BEGIN
  -- 查看政策
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = '使用者可以查看自己的對話記錄'
  ) THEN
    CREATE POLICY "使用者可以查看自己的對話記錄" ON chat_conversations
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  -- 創建政策
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = '使用者可以創建自己的對話記錄'
  ) THEN
    CREATE POLICY "使用者可以創建自己的對話記錄" ON chat_conversations
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  -- 更新政策
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = '使用者可以更新自己的對話記錄'
  ) THEN
    CREATE POLICY "使用者可以更新自己的對話記錄" ON chat_conversations
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  -- 刪除政策
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = '使用者可以刪除自己的對話記錄'
  ) THEN
    CREATE POLICY "使用者可以刪除自己的對話記錄" ON chat_conversations
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 安全地創建或替換觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 安全地創建觸發器
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_chat_conversations_updated_at'
  ) THEN
    CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 確保所有其他主要表格都已創建
-- 1. 繪本表
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  book_name_ch TEXT NOT NULL,
  book_name_en TEXT,
  style INTEGER,
  book_author TEXT,
  preface TEXT,
  book_frontcover TEXT,
  book_backcover TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 角色表
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  features TEXT,
  image TEXT,
  prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 故事段落表
CREATE TABLE IF NOT EXISTS story_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page INTEGER NOT NULL,
  user_input TEXT,
  en_user_input TEXT,
  position_input TEXT,
  user_pic_select TEXT,
  pic_generated BOOLEAN DEFAULT false,
  user_pic_input JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(book_id, page)
);

-- 4. 生成圖片表
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  story_page_id UUID NOT NULL REFERENCES story_pages(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT,
  style TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 為這些表格啟用 RLS (如果尚未啟用)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'books') AND 
     NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'books' AND rowsecurity = true) THEN
    ALTER TABLE books ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'characters') AND 
     NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'characters' AND rowsecurity = true) THEN
    ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'story_pages') AND 
     NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'story_pages' AND rowsecurity = true) THEN
    ALTER TABLE story_pages ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'generated_images') AND 
     NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'generated_images' AND rowsecurity = true) THEN
    ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;