import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import './db.js'; // 서버 시작 시 DB 연결 확인
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurants.js';
import reviewRoutes from './routes/reviews.js';
import userRoutes from './routes/users.js';
import allReviewRoutes from './routes/allReviews.js';
import restaurantStatusRoutes from './routes/restaurantStatus.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors()); // 다른 출처(프론트엔드)의 요청 허용
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })); // form 데이터 파싱
app.use((req, res, next) => {
  req.body ??= {}; // Express 5는 본문이 없으면 undefined이므로 빈 객체로 통일
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 업로드 파일 제공

// 라우터 (routes 폴더에 작성 후 등록)
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/restaurants/:restaurantId/reviews', reviewRoutes);
app.use('/api/users', userRoutes); // 마이페이지 (프로필 조회/수정, 회원 탈퇴)
app.use('/api/reviews', allReviewRoutes); // 리뷰 모아보기 (reviews + users + restaurants JOIN)
app.use('/api/restaurant-status', restaurantStatusRoutes); // 맛집 등록 현황 (restaurants + users JOIN)

// 서버 상태 확인용
app.get('/api/health', (req, res) => {
  res.json({ message: '서버 정상 작동 중' });
});

// 404 처리
app.use((req, res) => {
  res.status(404).json({ message: '요청한 경로를 찾을 수 없습니다.' });
});

// 에러 처리
app.use((err, req, res, next) => {
  // 사진 업로드(multer) 오류
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: '사진은 5MB까지 업로드할 수 있습니다.' });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: '사진 업로드에 실패했습니다.' });
  }

  console.error(err);
  // 예상하지 못한 오류의 내부 메시지는 사용자에게 보여주지 않음
  const status = err.status || 500;
  res.status(status).json({ message: status === 500 ? '서버 오류가 발생했습니다.' : err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
