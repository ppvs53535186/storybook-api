/**
 * 認證控制器
 * 處理使用者登入和 Token 生成
 */
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const supabase = require('../config/supabase');

dotenv.config();

/**
 * 使用者登入並取得 JWT
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        state: false,
        code: 400,
        msg: "請提供信箱和密碼",
        data: null
      });
    }

    // 檢查是否在開發/測試模式，讓模擬帳號可以正常運作
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (isDevelopment) {
      // 在開發環境中，使用硬編碼的模擬帳號
      const validCredentials = [
        { email: 'user@example.com', password: 'password123', id: '123' },
        { email: 'test@example.com', password: '12345678', id: '456' }
      ];

      const user = validCredentials.find(cred =>
        cred.email === email && cred.password === password
      );

      if (user) {
        // 生成 JWT Token
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET || 'your_jwt_secret',
          { expiresIn: '24h' }
        );

        return res.status(200).json({
          state: true,
          code: 0,
          msg: "success",
          data: {
            token,
            user: {
              id: user.id,
              email: user.email
            }
          }
        });
      }
    } else {
      // 在生產環境中，使用 Supabase 進行身份驗證
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({
          state: false,
          code: 401,
          msg: "信箱或密碼錯誤",
          data: null
        });
      }

      const user = data.user;

      // 生成 JWT Token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        state: true,
        code: 0,
        msg: "success",
        data: {
          token,
          user: {
            id: user.id,
            email: user.email
          }
        }
      });
    }

    // 如果都沒有匹配，返回認證錯誤
    return res.status(401).json({
      state: false,
      code: 401,
      msg: "信箱或密碼錯誤",
      data: null
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      state: false,
      code: 500,
      msg: error.message || "伺服器內部錯誤",
      data: null
    });
  }
};
/**
 * 注册用户
 * POST /api/auth/signUp
 */
const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        state: false,
        code: 400,
        msg: "請提供信箱和密碼",
        data: null
      });
    }


    // 在生產環境中，使用 Supabase 進行身份驗證
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        state: false,
        code: 401,
        msg: "失败",
        data: null
      });
    }

    return res.status(200).json({
      state: true,
      code: 0,
      msg: "success",
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      state: false,
      code: 500,
      msg: error.message || "伺服器內部錯誤",
      data: null
    });
  }
};

module.exports = {
  login,signUp
};