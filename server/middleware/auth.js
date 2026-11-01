import jwt from 'jsonwebtoken';

// 로그인한 사용자만 접근 가능하도록 토큰 검사
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // "Bearer 토큰"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, email, nickname }
    next();
  } catch {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};
