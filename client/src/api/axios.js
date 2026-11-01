import axios from 'axios'

// 모든 요청에 사용할 axios 인스턴스 (vite 프록시로 /api → localhost:5000)
const api = axios.create({
  baseURL: '/api',
})

// 로그인 토큰이 있으면 요청 헤더에 자동으로 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
