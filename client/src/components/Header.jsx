import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { IoRestaurant } from 'react-icons/io5'
import { useAuth } from '../context/AuthContext.js'

const Wrapper = styled.header`
  border-bottom: 1px solid #eee;
  background: #fff;
`

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  height: 64px;
  margin: 0 auto;
  padding: 0 20px;
`

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  font-weight: 700;
  color: #ff6b35;
`

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 15px;

  button {
    color: #666;
  }
`

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <Wrapper>
      <Inner>
        <Logo to="/">
          <IoRestaurant />
          학교앞 맛집
        </Logo>
        <Nav>
          {user ? (
            <>
              <span>{user.nickname}님</span>
              <button onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login">로그인</Link>
              <Link to="/register">회원가입</Link>
            </>
          )}
        </Nav>
      </Inner>
    </Wrapper>
  )
}

export default Header
