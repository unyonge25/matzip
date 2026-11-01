import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.js'
import { ErrorText, Form } from '../components/AuthForm.jsx'

function Login() {
  const location = useLocation()
  // 회원가입 직후 넘어온 경우 이메일을 미리 채워줌
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      // 가입되지 않은 이메일이면 회원가입 페이지로 이동 (입력한 이메일 전달)
      if (err.response?.status === 404) {
        alert('가입되지 않은 이메일입니다. 회원가입 페이지로 이동합니다.')
        navigate('/register', { state: { email: form.email } })
        return
      }
      setError(err.response?.data?.message || '로그인에 실패했습니다.')
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <h2>로그인</h2>
      <input name="email" type="email" placeholder="이메일" value={form.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="비밀번호" value={form.password} onChange={handleChange} required />
      {error && <ErrorText>{error}</ErrorText>}
      <button type="submit">로그인</button>
      <p>
        계정이 없나요? <Link to="/register">회원가입</Link>
      </p>
    </Form>
  )
}

export default Login
