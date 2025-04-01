/**
 * 繪本創作系統 API 入口點
 * 
 * 這個檔案是為了符合一些平台的要求而存在
 * 實際的應用程式入口點是 server.js
 */

// 引入主要應用程式
const app = require('./server.js');

// 如果直接執行此檔案，則啟動伺服器
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`繪本創作系統 API 伺服器執行於 http://localhost:${PORT}`);
  });
}

module.exports = app;