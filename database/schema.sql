-- 학교앞 맛집 DB 설계
create database if not exists matzip_20411;
use matzip_20411;

-- 회원
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,          -- 로그인 이메일
  password VARCHAR(255) NOT NULL,              -- bcrypt로 암호화한 비밀번호
  nickname VARCHAR(30) NOT NULL UNIQUE,        -- 닉네임
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 맛집
CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,                        -- 등록한 회원 (users 참조)
  name VARCHAR(100) NOT NULL,                  -- 가게 이름
  category ENUM('한식','중식','일식','양식','분식','카페','기타') NOT NULL,
  address VARCHAR(255) NOT NULL,               -- 주소
  phone VARCHAR(20),                           -- 전화번호
  description TEXT,                            -- 소개
  image VARCHAR(255),                          -- 사진 경로 (/uploads/파일명)
  lat DECIMAL(10,7),                           -- 위도 (지도용)
  lng DECIMAL(10,7),                           -- 경도 (지도용)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- 회원이 탈퇴하면 그 회원이 등록한 맛집도 삭제
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 리뷰
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,                  -- 리뷰 대상 맛집
  user_id INT NOT NULL,                        -- 작성한 회원
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),  -- 별점 1~5
  content TEXT NOT NULL,                       -- 리뷰 내용
  image VARCHAR(255),                          -- 리뷰 사진
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- 맛집이나 회원이 삭제되면 리뷰도 삭제
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 찜 (한 회원이 같은 맛집을 두 번 찜할 수 없음)
CREATE TABLE likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_like (user_id, restaurant_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
