import express from 'express';
import pool from '../db.js';

const router = express.Router();

// [JOIN 조회 메뉴] 맛집 등록 현황 : GET /api/restaurant-status
// 핵심 데이터 테이블(restaurants)과 회원 테이블(users)을 JOIN해서
// "어떤 맛집을 / 어느 회원이 등록했는지" 조회
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.name, r.category, r.address, r.created_at,
              u.id AS user_id, u.nickname
       FROM restaurants r
       INNER JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
