import styled from 'styled-components'
import { FaStar } from 'react-icons/fa'

const Stars = styled.div`
  display: inline-flex;
  gap: 2px;
  font-size: ${(props) => props.$size}px;

  button {
    display: flex;
    font-size: inherit;
  }
`

// 회색 별 위에 노란 별을 겹치고, 노란 별을 fill 비율만큼만 보여줌 (0.5면 왼쪽 반만)
const Star = styled.span`
  position: relative;
  display: flex;
  color: #ddd;

  .fill {
    position: absolute;
    top: 0;
    left: 0;
    width: ${(props) => props.$fill * 100}%;
    overflow: hidden;
    color: #ffc107;
  }

  /* 초기화 CSS의 svg max-width:100% 때문에 별이 찌그러지지 않도록 원래 크기 유지 */
  svg {
    flex-shrink: 0;
    max-width: none;
  }
`

// 별 하나가 얼마나 찰지 계산 (1: 꽉 참, 0.7: 70%만큼, 0: 빈 별)
// 예) 3.7점 → 1, 1, 1, 0.7, 0
const getFill = (value, n) => Math.min(Math.max(value - (n - 1), 0), 1)

// 별점 표시 / 선택 컴포넌트
// onChange를 넘기면 클릭해서 별점을 고를 수 있음
function StarRating({ value = 0, onChange, size = 16 }) {
  const score = Number(value) || 0 // DB에서 "3.7" 같은 문자열로 올 수 있어서 숫자로 변환

  return (
    <Stars $size={size}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Star $fill={getFill(score, n)}>
            <FaStar />
            <span className="fill">
              <FaStar />
            </span>
          </Star>
        )
        return onChange ? (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n}점`}>
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        )
      })}
    </Stars>
  )
}

export default StarRating
