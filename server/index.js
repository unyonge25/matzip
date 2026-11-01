import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import './db.js'; // 서버 시작 시 DB 연결 확인
import authRoutes from './routes/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors()); // 다른 출처(프론트엔드)의 요청 허용
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })); // form 데이터 파싱
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 업로드 파일 제공

// 라우터 (routes 폴더에 작성 후 등록)
app.use('/api/auth', authRoutes);

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
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || '서버 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
