import jwt from 'jsonwebtoken';
import pool from '../db.js';

// 토큰이 만료됐거나 탈퇴한 회원일 때의 응답 (code를 보고 클라이언트가 로그아웃 처리)
const rejectToken = (res) =>
  res.status(401).json({
    code: 'INVALID_TOKEN',
    message: '로그인 정보가 만료되었습니다. 다시 로그인해주세요.',
  });

// 로그인한 사용자만 접근 가능하도록 토큰 검사
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization; // "Bearer 토큰"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET); // { id, email, nickname }
  } catch {
    return rejectToken(res);
  }

  try {
    // 토큰이 유효해도 이미 탈퇴한 회원이면 거부
    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) return rejectToken(res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }

  req.user = decoded;
  next();
};
