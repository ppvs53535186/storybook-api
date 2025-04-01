/*
  # 繪本創作系統初始結構

  1. 新增資料表
    - `books` - 儲存繪本基本資訊
    - `characters` - 儲存繪本角色資訊
    - `story_pages` - 儲存繪本故事段落
    - `generated_images` - 儲存 AI 生成的圖片資訊

  2. 安全性
    - 為所有資料表啟用行級安全性 (RLS)
    - 添加安全性策略，確保使用者只能存取自己的資料
*/

-- 創建繪本資料表
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

-- 創建角色資料表
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

-- 創建故事段落資料表
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

-- 創建生成圖片資料表
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  story_page_id UUID NOT NULL REFERENCES story_pages(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT,
  style TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 啟用行級安全性 (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- 創建安全性策略
-- 書籍表策略
CREATE POLICY "使用者可以查看自己的繪本" ON books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "使用者可以創建自己的繪本" ON books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "使用者可以更新自己的繪本" ON books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "使用者可以刪除自己的繪本" ON books
  FOR DELETE USING (auth.uid() = user_id);

-- 角色表策略
CREATE POLICY "使用者可以查看自己的角色" ON characters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "使用者可以創建自己的角色" ON characters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "使用者可以更新自己的角色" ON characters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "使用者可以刪除自己的角色" ON characters
  FOR DELETE USING (auth.uid() = user_id);

-- 故事段落表策略
CREATE POLICY "使用者可以查看自己的故事段落" ON story_pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "使用者可以創建自己的故事段落" ON story_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "使用者可以更新自己的故事段落" ON story_pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "使用者可以刪除自己的故事段落" ON story_pages
  FOR DELETE USING (auth.uid() = user_id);

-- 生成圖片表策略
CREATE POLICY "使用者可以查看自己的生成圖片" ON generated_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "使用者可以創建自己的生成圖片" ON generated_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "使用者可以刪除自己的生成圖片" ON generated_images
  FOR DELETE USING (auth.uid() = user_id);