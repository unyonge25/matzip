import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// 사진 파일을 server/uploads 폴더에 "시간_랜덤숫자.확장자" 이름으로 저장
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

// 형식(mimetype)은 속일 수 있으므로 확장자도 함께 검사
// (html, svg 등은 브라우저에서 스크립트가 실행될 수 있어 허용하지 않음)
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// 이미지 파일만 허용, 최대 5MB
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype.startsWith('image/') && ALLOWED_EXTENSIONS.includes(ext)) cb(null, true);
    else {
      const error = new Error('이미지 파일만 업로드할 수 있습니다.');
      error.status = 400;
      cb(error);
    }
  },
});

// DB에 저장된 경로(/uploads/파일명)의 실제 파일 삭제
export const deleteImage = (imagePath) => {
  if (!imagePath) return;
  const filePath = path.join(UPLOAD_DIR, path.basename(imagePath));
  fs.unlink(filePath, () => {}); // 파일이 없어도 오류 무시
};
