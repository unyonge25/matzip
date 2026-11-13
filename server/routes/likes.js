import express from 'express';
import pool from '../db.js';
import { verifyToken } from '../middleware/auth.js';

// mergeParams : 주소의 :restaurantId 값을 이 라우터에서도 사용
const router = express.Router({ mergeParams: true });

// 이 파일의 모든 기능은 로그인한 회원만 사용 가능
router.use(verifyToken);

// 내가 찜했는지 확인 : GET /api/restaurants/:restaurantId/like
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM likes WHERE user_id = ? AND restaurant_id = ?',
      [req.user.id, req.params.restaurantId]
    );
    res.json({ liked: rows.length > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 찜하기 : POST /api/restaurants/:restaurantId/like
router.post('/', async (req, res) => {
  try {
    const [exists] = await pool.query('SELECT id FROM restaurants WHERE id = ?', [req.params.restaurantId]);
    if (exists.length === 0) {
      return res.status(404).json({ message: '맛집을 찾을 수 없습니다.' });
    }

    // 이미 찜한 맛집이면 UNIQUE 제약에 걸리므로 INSERT IGNORE로 무시
    await pool.query('INSERT IGNORE INTO likes (user_id, restaurant_id) VALUES (?, ?)', [
      req.user.id,
      req.params.restaurantId,
    ]);
    res.status(201).json({ liked: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 찜 취소 : DELETE /api/restaurants/:restaurantId/like
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM likes WHERE user_id = ? AND restaurant_id = ?', [
      req.user.id,
      req.params.restaurantId,
    ]);
    res.json({ liked: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
