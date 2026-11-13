import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { IoRestaurant, IoLocationSharp, IoCall } from 'react-icons/io5'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.js'
import StarRating from '../components/StarRating.jsx'
import { ErrorText } from '../components/AuthForm.jsx'
import { MAIN_COLOR } from '../constants.js'

const Wrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`

const Photo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  background: #fff4ef;
  color: ${MAIN_COLOR};
  font-size: 80px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const Info = styled.section`
  padding: 20px 0;
  border-bottom: 1px solid #eee;

  .category {
    color: ${MAIN_COLOR};
    font-weight: 700;
  }

  h1 {
    margin: 4px 0 8px;
    font-size: 30px;
    font-weight: 700;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: #555;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #555;
  }

  .description {
    margin-top: 16px;
    white-space: pre-wrap;
  }

  .writer {
    margin-top: 12px;
    font-size: 13px;
    color: #999;
  }
`

const LikeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 8px 16px;
  border: 1px solid ${(props) => (props.$liked ? MAIN_COLOR : '#ddd')};
  border-radius: 8px;
  color: ${(props) => (props.$liked ? MAIN_COLOR : '#555')};
  font-size: 14px;
`

const OwnerButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;

  a,
  button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
  }

  button {
    border-color: #e03131;
    color: #e03131;
  }
`

const Reviews = styled.section`
  padding: 20px 0;

  h2 {
    margin-bottom: 16px;
    font-size: 20px;
    font-weight: 700;
  }
`

const ReviewForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 12px;
  background: #fafafa;

  textarea {
    min-height: 80px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    resize: vertical;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .actions button {
    padding: 8px 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .actions button[type='submit'] {
    border-color: ${MAIN_COLOR};
    background: ${MAIN_COLOR};
    color: #fff;
    font-weight: 700;
  }
`

const ReviewItem = styled.li`
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;

  .head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 14px;
  }

  .nickname {
    font-weight: 700;
  }

  .date {
    color: #999;
  }

  .owner {
    display: flex;
    gap: 10px;
    margin-left: auto;
    font-size: 13px;
  }

  .delete {
    color: #e03131;
  }

  p {
    white-space: pre-wrap;
  }
`

const Notice = styled.p`
  margin-bottom: 24px;
  color: #888;

  a {
    color: ${MAIN_COLOR};
    font-weight: 700;
  }
`

const formatDate = (date) => new Date(date).toLocaleDateString('ko-KR')

function RestaurantDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const userId = user?.id
  const navigate = useNavigate()

  const [restaurant, setRestaurant] = useState(null)
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(false)
  const [editing, setEditing] = useState(null) // 수정 중인 리뷰 { id, rating, content }
  const [editError, setEditError] = useState('')

  // 리뷰 작성/삭제 후 이 값을 1 올리면 아래 useEffect가 다시 실행되어 평균 별점까지 갱신됨
  const [reloadKey, setReloadKey] = useState(0)
  const reload = () => setReloadKey((k) => k + 1)

  // 맛집 정보와 리뷰 목록을 함께 불러옴
  useEffect(() => {
    Promise.all([api.get(`/restaurants/${id}`), api.get(`/restaurants/${id}/reviews`)])
      .then(([restaurantRes, reviewsRes]) => {
        setRestaurant(restaurantRes.data)
        setReviews(reviewsRes.data)
      })
      .catch(() => {
        alert('맛집을 찾을 수 없습니다.')
        navigate('/')
      })
  }, [id, navigate, reloadKey])

  // 로그인한 경우 내가 찜했는지 확인
  useEffect(() => {
    if (!userId) return
    api
      .get(`/restaurants/${id}/like`)
      .then((res) => setLiked(res.data.liked))
      .catch(() => {})
  }, [id, userId])

  const handleLike = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      if (liked) await api.delete(`/restaurants/${id}/like`)
      else await api.post(`/restaurants/${id}/like`)
      setLiked(!liked)
      reload() // 찜 수 갱신
    } catch (err) {
      alert(err.response?.data?.message || '찜하기에 실패했습니다.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('이 맛집을 삭제할까요? 리뷰도 모두 삭제됩니다.')) return
    try {
      await api.delete(`/restaurants/${id}`)
      navigate('/')
    } catch (err) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.')
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      setError('별점을 선택해주세요.')
      return
    }
    try {
      await api.post(`/restaurants/${id}/reviews`, { rating, content })
      setRating(0)
      setContent('')
      setError('')
      reload()
    } catch (err) {
      setError(err.response?.data?.message || '리뷰 등록에 실패했습니다.')
    }
  }

  const startEdit = (review) => {
    setEditing({ id: review.id, rating: review.rating, content: review.content })
    setEditError('')
  }

  const handleReviewEdit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/restaurants/${id}/reviews/${editing.id}`, {
        rating: editing.rating,
        content: editing.content,
      })
      setEditing(null)
      reload()
    } catch (err) {
      setEditError(err.response?.data?.message || '리뷰 수정에 실패했습니다.')
    }
  }

  const handleReviewDelete = async (reviewId) => {
    if (!confirm('리뷰를 삭제할까요?')) return
    try {
      await api.delete(`/restaurants/${id}/reviews/${reviewId}`)
      reload()
    } catch (err) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.')
    }
  }

  if (!restaurant) return <p>불러오는 중...</p>

  const isOwner = user && user.id === restaurant.user_id

  return (
    <Wrapper>
      <Photo>{restaurant.image ? <img src={restaurant.image} alt={restaurant.name} /> : <IoRestaurant />}</Photo>

      <Info>
        <span className="category">{restaurant.category}</span>
        <h1>{restaurant.name}</h1>
        <div className="rating">
          <StarRating value={restaurant.avg_rating || 0} size={20} />
          {restaurant.review_count > 0
            ? `${restaurant.avg_rating}점 · 리뷰 ${restaurant.review_count}개`
            : '아직 리뷰가 없어요'}
        </div>
        <p className="row">
          <IoLocationSharp /> {restaurant.address}
        </p>
        {restaurant.phone && (
          <p className="row">
            <IoCall /> {restaurant.phone}
          </p>
        )}
        {restaurant.description && <p className="description">{restaurant.description}</p>}
        <p className="writer">
          {restaurant.nickname}님이 {formatDate(restaurant.created_at)}에 등록
        </p>

        <LikeButton type="button" $liked={user && liked} onClick={handleLike} aria-pressed={Boolean(user && liked)}>
          {user && liked ? <FaHeart /> : <FaRegHeart />}찜 {restaurant.like_count}
        </LikeButton>

        {isOwner && (
          <OwnerButtons>
            <Link to={`/restaurants/${id}/edit`}>수정</Link>
            <button onClick={handleDelete}>삭제</button>
          </OwnerButtons>
        )}
      </Info>

      <Reviews>
        <h2>리뷰 {reviews.length}</h2>

        {user ? (
          <ReviewForm onSubmit={handleReviewSubmit}>
            <StarRating value={rating} onChange={setRating} size={28} />
            <textarea
              placeholder="맛, 양, 가격은 어땠나요?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            {error && <ErrorText>{error}</ErrorText>}
            <div className="actions">
              <button type="submit">리뷰 등록</button>
            </div>
          </ReviewForm>
        ) : (
          <Notice>
            리뷰를 쓰려면 <Link to="/login">로그인</Link>해주세요.
          </Notice>
        )}

        <ul>
          {reviews.map((review) => (
            <ReviewItem key={review.id}>
              {editing?.id === review.id ? (
                <ReviewForm onSubmit={handleReviewEdit}>
                  <StarRating
                    value={editing.rating}
                    onChange={(value) => setEditing({ ...editing, rating: value })}
                    size={28}
                  />
                  <textarea
                    value={editing.content}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                    required
                  />
                  {editError && <ErrorText>{editError}</ErrorText>}
                  <div className="actions">
                    <button type="button" onClick={() => setEditing(null)}>
                      취소
                    </button>
                    <button type="submit">저장</button>
                  </div>
                </ReviewForm>
              ) : (
                <>
                  <div className="head">
                    <span className="nickname">{review.nickname}</span>
                    <StarRating value={review.rating} size={14} />
                    <span className="date">{formatDate(review.created_at)}</span>
                    {user?.id === review.user_id && (
                      <span className="owner">
                        <button onClick={() => startEdit(review)}>수정</button>
                        <button className="delete" onClick={() => handleReviewDelete(review.id)}>
                          삭제
                        </button>
                      </span>
                    )}
                  </div>
                  <p>{review.content}</p>
                </>
              )}
            </ReviewItem>
          ))}
        </ul>
      </Reviews>
    </Wrapper>
  )
}

export default RestaurantDetail
