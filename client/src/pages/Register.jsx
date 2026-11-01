import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { ErrorText, Form } from '../components/AuthForm.jsx'

function Register() {
  const location = useLocation()
  // 로그인 페이지에서 넘어온 경우 이메일을 미리 채워줌
  const [form, setForm] = useState({
    email: location.state?.email || '',
    nickname: '',
    password: '',
    passwordCheck: '',
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.passwordCheck) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    try {
      await api.post('/auth/register', {
        email: form.email,
        nickname: form.nickname,
        password: form.password,
      })
      alert('회원가입이 완료되었습니다. 로그인해주세요.')
      navigate('/login', { state: { email: form.email } })
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.')
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <h2>회원가입</h2>
      <input name="email" type="email" placeholder="이메일" value={form.email} onChange={handleChange} required />
      <input name="nickname" placeholder="닉네임" value={form.nickname} onChange={handleChange} required />
      <input name="password" type="password" placeholder="비밀번호" value={form.password} onChange={handleChange} required />
      <input name="passwordCheck" type="password" placeholder="비밀번호 확인" value={form.passwordCheck} onChange={handleChange} required />
      {error && <ErrorText>{error}</ErrorText>}
      <button type="submit">회원가입</button>
      <p>
        이미 계정이 있나요? <Link to="/login">로그인</Link>
      </p>
    </Form>
  )
}

export default Register
