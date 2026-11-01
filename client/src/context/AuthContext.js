import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// 어느 컴포넌트에서든 로그인 정보 사용 : const { user, login, logout } = useAuth()
export const useAuth = () => useContext(AuthContext)
