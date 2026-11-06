import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { IoLocationSharp } from 'react-icons/io5'
import api from '../api/axios.js'
import StarRating from '../components/StarRating.jsx'
import { CATEGORIES, MAIN_COLOR } from '../constants.js'

const Wrapper = styled.div`
  max-width: 760px;
  margin: 0 auto;

  h1 {
    font-size: 26px;
    font-weight: 700;
  }

  .desc {
    margin: 4px 0 16px;
    font-size: 14px;
    color: #888;
  }
`

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;

  select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
`

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Card = styled.li`
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`

// 맛집 정보 (이름, 카테고리, 주소)
const Place = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #eee;

  a {
    font-size: 18px;
    font-weight: 700;
  }

  a:hover {
    color: ${MAIN_COLOR};
  }

  .category {
    padding: 2px 10px;
    border-radius: 12px;
    background: #fff4ef;
    color: ${MAIN_COLOR};
    font-size: 12px;
    font-weight: 700;
  }

  .address {
    display: flex;
    align-items: center;
    gap: 2px;
    width: 100%;
    font-size: 13px;
    color: #999;
  }
`

// 별점 + 점수
const Score = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 14px 0 8px;

  strong {
    font-size: 18px;
    font-weight: 700;
  }
`

// 리뷰 본문 (가장 눈에 띄게)
const Content = styled.p`
  font-size: 16px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
`

// 작성자 + 작성일
const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  font-size: 13px;
  color: #999;

  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${MAIN_COLOR};
    color: #fff;
    font-weight: 700;
  }

  .nickname {
    color: #333;
    font-weight: 700;
  }
`

const Empty = styled.p`
  padding: 60px 0;
  color: #888;
  text-align: center;
`

const formatDate = (date) => new Date(date).toLocaleDateString('ko-KR')

// 리뷰 모아보기
// 서버에서 reviews + users + restaurants 테이블을 JOIN한 결과를 카드로 보여줌
function ReviewFeed() {
  const [reviews, setReviews] = useState([])
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('latest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/reviews', { params: { category: category || undefined, sort } })
      .then((res) => setReviews(res.data))
      .catch(() => alert('리뷰를 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [category, sort])

  return (
    <Wrapper>
      <h1>리뷰 모아보기</h1>
      <p className="desc">모든 회원이 남긴 리뷰를 맛집 정보와 함께 볼 수 있어요. (총 {reviews.length}개)</p>

      <Filters>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="카테고리">
          <option value="">전체 카테고리</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="정렬">
          <option value="latest">최신순</option>
          <option value="rating">별점 높은순</option>
        </select>
      </Filters>

      {loading ? (
        <Empty>불러오는 중...</Empty>
      ) : reviews.length === 0 ? (
        <Empty>아직 리뷰가 없어요.</Empty>
      ) : (
        <List>
          {reviews.map((review) => (
            <Card key={review.id}>
              <Place>
                <Link to={`/restaurants/${review.restaurant_id}`}>{review.restaurant_name}</Link>
                <span className="category">{review.category}</span>
                <span className="address">
                  <IoLocationSharp /> {review.address}
                </span>
              </Place>

              <Score>
                <StarRating value={review.rating} size={20} />
                <strong>{review.rating}.0</strong>
              </Score>

              <Content>{review.content}</Content>

              <Meta>
                <span className="avatar">{review.nickname.charAt(0)}</span>
                <span className="nickname">{review.nickname}</span>
                <span>· {formatDate(review.created_at)}</span>
              </Meta>
            </Card>
          ))}
        </List>
      )}
    </Wrapper>
  )
}

export default ReviewFeed
