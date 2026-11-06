import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// 토큰 발급 (마이페이지에서 닉네임을 바꾸면 새 토큰을 발급하기 위해 export)
export const createToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, nickname: user.nickname },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

// 회원가입 : POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const nickname = req.body.nickname?.trim();

  if (!email || !password || !nickname) {
    return res.status(400).json({ message: '모든 항목을 입력해주세요.' });
  }
  // DB 컬럼 길이에 맞춰 검사
  if (email.length > 100 || nickname.length > 30) {
    return res.status(400).json({ message: '이메일은 100자, 닉네임은 30자까지 입력할 수 있습니다.' });
  }

  try {
    const [exists] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR nickname = ?',
      [email, nickname]
    );
    if (exists.length > 0) {
      return res.status(409).json({ message: '이미 사용 중인 이메일 또는 닉네임입니다.' });
    }

    const hashed = await bcrypt.hash(password, 10); // 비밀번호 암호화
    await pool.query(
      'INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)',
      [email, hashed, nickname]
    );

    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인 : POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: '가입되지 않은 이메일입니다.' });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: '비밀번호가 올바르지 않습니다.' });
    }

    res.json({
      token: createToken(user),
      user: { id: user.id, email: user.email, nickname: user.nickname },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 내 정보 : GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
