import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { deleteImage } from '../middleware/upload.js';
import { createToken } from './auth.js';

const router = express.Router();

// 이 파일의 모든 기능은 로그인한 회원만 사용 가능
router.use(verifyToken);

// 내 프로필 조회 (Read) : GET /api/users/me
router.get('/me', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.nickname, u.created_at,
              (SELECT COUNT(*) FROM restaurants WHERE user_id = u.id) AS restaurant_count,
              (SELECT COUNT(*) FROM reviews WHERE user_id = u.id) AS review_count
       FROM users u
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: '회원 정보를 찾을 수 없습니다.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 내 프로필 수정 (Update) : PUT /api/users/me
// 닉네임 변경, 비밀번호 변경(현재 비밀번호 확인 필요)
router.put('/me', async (req, res) => {
  const nickname = req.body.nickname?.trim();
  const { currentPassword, newPassword } = req.body;

  if (!nickname) {
    return res.status(400).json({ message: '닉네임을 입력해주세요.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: '회원 정보를 찾을 수 없습니다.' });
    }

    // 다른 회원이 이미 쓰는 닉네임인지 확인
    const [dup] = await pool.query(
      'SELECT id FROM users WHERE nickname = ? AND id <> ?',
      [nickname, user.id]
    );
    if (dup.length > 0) {
      return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
    }

    let password = user.password;
    if (newPassword) {
      if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
      }
      password = await bcrypt.hash(newPassword, 10); // 새 비밀번호도 암호화해서 저장
    }

    await pool.query('UPDATE users SET nickname = ?, password = ? WHERE id = ?', [
      nickname,
      password,
      user.id,
    ]);

    // 토큰에 닉네임이 들어 있으므로 새 토큰 발급
    const updated = { id: user.id, email: user.email, nickname };
    res.json({ message: '회원 정보가 수정되었습니다.', token: createToken(updated), user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 회원 탈퇴 (Delete) : DELETE /api/users/me  (비밀번호 확인 필요)
// ON DELETE CASCADE로 내가 등록한 맛집, 리뷰, 찜도 함께 삭제됨
router.delete('/me', async (req, res) => {
  const { password } = req.body;

  try {
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '회원 정보를 찾을 수 없습니다.' });
    }
    if (!password || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ message: '비밀번호가 올바르지 않습니다.' });
    }

    // 맛집 사진 파일은 DB가 지워주지 않으므로 먼저 경로를 받아둠
    const [images] = await pool.query(
      'SELECT image FROM restaurants WHERE user_id = ? AND image IS NOT NULL',
      [req.user.id]
    );

    await pool.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    images.forEach((row) => deleteImage(row.image));

    res.json({ message: '회원 탈퇴가 완료되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 내가 등록한 맛집 : GET /api/users/me/restaurants
router.get('/me/restaurants', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, ROUND(AVG(v.rating), 1) AS avg_rating, COUNT(v.id) AS review_count
       FROM restaurants r
       LEFT JOIN reviews v ON v.restaurant_id = r.id
       WHERE r.user_id = ?
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 내가 쓴 리뷰 (reviews + restaurants JOIN) : GET /api/users/me/reviews
router.get('/me/reviews', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.id, v.rating, v.content, v.created_at,
              r.id AS restaurant_id, r.name AS restaurant_name, r.category
       FROM reviews v
       JOIN restaurants r ON v.restaurant_id = r.id
       WHERE v.user_id = ?
       ORDER BY v.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
