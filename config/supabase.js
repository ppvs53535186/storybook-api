/**
 * Supabase 客戶端配置
 * 用於連接 Supabase 數據庫和服務
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 載入環境變數
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 檢查環境變數，並設定默認值用於開發環境
const supabaseUrl = process.env.SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'example_key_for_dev_only';

// 警告訊息，而不是終止程序
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('警告: 使用開發環境的預設 Supabase 配置。實際部署時請設定正確的 SUPABASE_URL 和 SUPABASE_ANON_KEY 環境變數。');
}

// 創建 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;