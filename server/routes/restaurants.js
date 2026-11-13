import express from 'express';
import pool from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { upload, deleteImage } from '../middleware/upload.js';

const router = express.Router();

const CATEGORIES = ['한식', '중식', '일식', '양식', '분식', '카페', '기타'];

// 맛집 정보 + 등록자 닉네임 + 평균 별점 + 리뷰 수 + 찜 수
const SELECT_RESTAURANT = `
  SELECT r.*, u.nickname,
         ROUND(AVG(v.rating), 1) AS avg_rating,
         COUNT(v.id) AS review_count,
         (SELECT COUNT(*) FROM likes l WHERE l.restaurant_id = r.id) AS like_count
  FROM restaurants r
  JOIN users u ON r.user_id = u.id
  LEFT JOIN reviews v ON v.restaurant_id = r.id
`;

// 입력값 검사 (문제가 있으면 오류 메시지 반환)
const validate = ({ name, category, address, phone }) => {
  if (!name || !category || !address) return '가게 이름, 카테고리, 주소는 꼭 입력해주세요.';
  if (!CATEGORIES.includes(category)) return '올바르지 않은 카테고리입니다.';
  // DB 컬럼 길이에 맞춰 검사
  if (name.length > 100 || address.length > 255 || phone?.length > 20) {
    return '가게 이름은 100자, 주소는 255자, 전화번호는 20자까지 입력할 수 있습니다.';
  }
  return null;
};

// 맛집 목록 : GET /api/restaurants?category=한식&q=검색어
router.get('/', async (req, res) => {
  const { category, q } = req.query;
  const where = [];
  const params = [];

  if (category) {
    where.push('r.category = ?');
    params.push(category);
  }
  if (q) {
    where.push('(r.name LIKE ? OR r.address LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  try {
    const [rows] = await pool.query(
      `${SELECT_RESTAURANT}
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       GROUP BY r.id, u.nickname
       ORDER BY r.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 맛집 상세 : GET /api/restaurants/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `${SELECT_RESTAURANT} WHERE r.id = ? GROUP BY r.id, u.nickname`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: '맛집을 찾을 수 없습니다.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 맛집 등록 : POST /api/restaurants (로그인 필요, 사진은 image 필드)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  const { name, category, address, phone, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const error = validate(req.body);
  if (error) {
    deleteImage(image);
    return res.status(400).json({ message: error });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO restaurants (user_id, name, category, address, phone, description, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, category, address, phone || null, description || null, image]
    );
    res.status(201).json({ id: result.insertId, message: '맛집이 등록되었습니다.' });
  } catch (error) {
    console.error(error);
    deleteImage(image);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 등록한 본인인지 확인하고 맛집 정보를 반환 (아니면 응답을 보내고 null 반환)
const findOwnRestaurant = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    res.status(404).json({ message: '맛집을 찾을 수 없습니다.' });
    return null;
  }
  if (rows[0].user_id !== req.user.id) {
    res.status(403).json({ message: '본인이 등록한 맛집만 수정/삭제할 수 있습니다.' });
    return null;
  }
  return rows[0];
};

// 맛집 수정 : PUT /api/restaurants/:id (등록한 본인만)
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  const newImage = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const restaurant = await findOwnRestaurant(req, res);
    if (!restaurant) {
      deleteImage(newImage);
      return;
    }

    const error = validate(req.body);
    if (error) {
      deleteImage(newImage);
      return res.status(400).json({ message: error });
    }

    const { name, category, address, phone, description } = req.body;
    await pool.query(
      `UPDATE restaurants
       SET name = ?, category = ?, address = ?, phone = ?, description = ?, image = ?
       WHERE id = ?`,
      [name, category, address, phone || null, description || null,
        newImage || restaurant.image, req.params.id]
    );

    if (newImage) deleteImage(restaurant.image); // 새 사진을 올렸으면 예전 사진 삭제
    res.json({ message: '맛집 정보가 수정되었습니다.' });
  } catch (error) {
    console.error(error);
    deleteImage(newImage);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 맛집 삭제 : DELETE /api/restaurants/:id (등록한 본인만, 리뷰도 함께 삭제됨)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const restaurant = await findOwnRestaurant(req, res);
    if (!restaurant) return;

    await pool.query('DELETE FROM restaurants WHERE id = ?', [req.params.id]);
    deleteImage(restaurant.image);
    res.json({ message: '맛집이 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
