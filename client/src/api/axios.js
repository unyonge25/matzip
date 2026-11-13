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

// 토큰이 만료됐거나 탈퇴한 계정이면 로그인 정보를 지우고 로그인 페이지로 이동
// (토큰이 남아 있을 때만 처리해서, 요청 여러 개가 동시에 실패해도 안내는 한 번만 띄움)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.code === 'INVALID_TOKEN' && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      alert(error.response.data.message)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
