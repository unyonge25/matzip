import { useState } from 'react'
import { AuthContext } from './AuthContext.js'

// 새로고침해도 로그인 상태가 유지되도록 localStorage에서 불러옴
const getSavedUser = () => {
  const saved = localStorage.getItem('user')
  return saved ? JSON.parse(saved) : null
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser)

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
