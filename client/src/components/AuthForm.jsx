import styled from 'styled-components'

// 로그인 / 회원가입 페이지에서 함께 쓰는 폼 스타일
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  margin: 60px auto;

  h2 {
    margin-bottom: 12px;
    font-size: 26px;
    font-weight: 700;
    text-align: center;
  }

  input {
    height: 48px;
    padding: 0 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  button {
    height: 48px;
    margin-top: 8px;
    border-radius: 8px;
    background: #ff6b35;
    color: #fff;
    font-weight: 700;
  }

  p {
    font-size: 14px;
    text-align: center;
  }

  a {
    color: #ff6b35;
    font-weight: 700;
  }
`

export const ErrorText = styled.p`
  color: #e03131;
`
