import express from 'express';
import pool from '../db.js';
import { verifyToken } from '../middleware/auth.js';

// mergeParams : 주소의 :restaurantId 값을 이 라우터에서도 사용
const router = express.Router({ mergeParams: true });

// 리뷰 목록 : GET /api/restaurants/:restaurantId/reviews
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.id, v.user_id, v.rating, v.content, v.created_at, u.nickname
       FROM reviews v
       JOIN users u ON v.user_id = u.id
       WHERE v.restaurant_id = ?
       ORDER BY v.created_at DESC`,
      [req.params.restaurantId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 리뷰 작성 : POST /api/restaurants/:restaurantId/reviews (로그인 필요)
router.post('/', verifyToken, async (req, res) => {
  const { restaurantId } = req.params;
  const rating = Number(req.body.rating);
  const content = req.body.content?.trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: '별점은 1~5점 중에서 선택해주세요.' });
  }
  if (!content) {
    return res.status(400).json({ message: '리뷰 내용을 입력해주세요.' });
  }

  try {
    const [exists] = await pool.query('SELECT id FROM restaurants WHERE id = ?', [restaurantId]);
    if (exists.length === 0) {
      return res.status(404).json({ message: '맛집을 찾을 수 없습니다.' });
    }

    await pool.query(
      'INSERT INTO reviews (restaurant_id, user_id, rating, content) VALUES (?, ?, ?, ?)',
      [restaurantId, req.user.id, rating, content]
    );
    res.status(201).json({ message: '리뷰가 등록되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 리뷰 삭제 : DELETE /api/restaurants/:restaurantId/reviews/:reviewId (작성한 본인만)
router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id FROM reviews WHERE id = ? AND restaurant_id = ?',
      [req.params.reviewId, req.params.restaurantId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' });
    }
    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: '본인이 작성한 리뷰만 삭제할 수 있습니다.' });
    }

    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.reviewId]);
    res.json({ message: '리뷰가 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
