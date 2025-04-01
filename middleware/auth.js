const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      state: false,
      code: 401,
      msg: '未提供身份驗證 Token',
      data: null
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      state: false,
      code: 403,
      msg: 'Token 無效或已過期',
      data: null
    });
  }
};

module.exports = {
  authenticateToken
};