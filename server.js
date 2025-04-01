const express = require('express');
   const cors = require('cors');
   const morgan = require('morgan');
   const dotenv = require('dotenv');

   // Load environment variables
   dotenv.config();

   // Initialize Express app
   const app = express();
   const PORT = process.env.PORT || 3000;

   // CORS 設定 - 針對部署環境
   const corsOptions = {
     origin: process.env.NODE_ENV === 'production' 
       ? [
           'https://your-frontend-domain.com', // 替換為您的前端應用網址
           /\.render\.com$/ // 允許所有 render.com 子域名
         ]
       : '*',
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization']
   };

   // Middleware
   app.use(cors(corsOptions));
   app.use(express.json());
   app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

   // Import routes
   const authRoutes = require('./routes/authRoutes');
   const bookRoutes = require('./routes/bookRoutes');
   const characterRoutes = require('./routes/characterRoutes');
   const dataRoutes = require('./routes/dataRoutes');
   const promptRoutes = require('./routes/promptRoutes');
   const imageRoutes = require('./routes/imageRoutes');
   const translateRoutes = require('./routes/translateRoutes');
   const storySegmentationRoutes = require('./routes/storySegmentationRoutes');
   const chatRoutes = require('./routes/chatRoutes');

   // Authentication middleware
   const { authenticateToken } = require('./middleware/auth');

   // Auth routes (不需要認證)
   app.use('/api/auth', authRoutes);

   // Protected routes (需要認證)
   app.use('/api/book', authenticateToken, bookRoutes);
   app.use('/api/book/character', authenticateToken, characterRoutes);
   app.use('/api/book/data', authenticateToken, dataRoutes);
   app.use('/api/book/prompt', authenticateToken, promptRoutes);
   app.use('/api/book/image', authenticateToken, imageRoutes);
   app.use('/api/translate', authenticateToken, translateRoutes);
   app.use('/api/book/story-segmentation', authenticateToken, storySegmentationRoutes);
   app.use('/api/chat', authenticateToken, chatRoutes);

   // 簡單的健康檢查路由，無需認證
   app.get('/health', (req, res) => {
     res.status(200).json({
       state: true,
       message: 'API 服務正常運行'
     });
   });

   // Error handling middleware
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).json({
       state: false,
       code: 500,
       msg: err.message || 'Internal Server Error',
       data: null
     });
   });

   // Start server
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });

   module.exports = app;