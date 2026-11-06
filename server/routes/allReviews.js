import express from 'express';
import pool from '../db.js';

const router = express.Router();

// [JOIN 조회 메뉴] 리뷰 모아보기 : GET /api/reviews?category=한식&sort=rating
// reviews(리뷰) + users(작성자) + restaurants(맛집) 세 테이블을 JOIN해서
// "누가 / 어느 맛집에 / 몇 점을 / 어떤 내용으로" 남겼는지 한 번에 조회
router.get('/', async (req, res) => {
  const { category, sort } = req.query;
  const params = [];
  let where = '';

  if (category) {
    where = 'WHERE r.category = ?';
    params.push(category);
  }

  // 정렬 : 최신순(기본) / 별점 높은순
  const orderBy = sort === 'rating' ? 'v.rating DESC, v.created_at DESC' : 'v.created_at DESC';

  try {
    const [rows] = await pool.query(
      `SELECT v.id, v.rating, v.content, v.created_at,
              u.nickname,
              r.id AS restaurant_id, r.name AS restaurant_name, r.category, r.address
       FROM reviews v
       JOIN users u ON v.user_id = u.id
       JOIN restaurants r ON v.restaurant_id = r.id
       ${where}
       ORDER BY ${orderBy}`,
      params
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
