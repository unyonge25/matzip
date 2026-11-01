import mysql from 'mysql2/promise'; // Promise 기반 MySQL 클라이언트
import dotenv from 'dotenv'; // .env 환경 변수 로드

dotenv.config(); // .env 파일의 값을 process.env에 등록

const pool = mysql.createPool({ // 커넥션 풀 생성 (연결을 재사용)
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true, // 연결이 모두 사용 중이면 대기
  connectionLimit: 10, // 최대 동시 연결 수
  queueLimit: 0 // 대기열 제한 없음
});

try {
  const connection = await pool.getConnection();
  console.log('✅ MySQL 데이터베이스 연결 성공!');
  connection.release(); // 연결을 풀에 반납
} catch (error) {
  console.error('❌ MySQL 데이터베이스 연결 실패:', error.message);
}

export default pool;
