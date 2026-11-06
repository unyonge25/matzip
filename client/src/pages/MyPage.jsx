import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.js'
import RestaurantCard from '../components/RestaurantCard.jsx'
import StarRating from '../components/StarRating.jsx'
import { ErrorText } from '../components/AuthForm.jsx'
import { MAIN_COLOR } from '../constants.js'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 900px;
  margin: 0 auto;

  h1 {
    font-size: 26px;
    font-weight: 700;
  }

  h2 {
    margin-bottom: 12px;
    font-size: 20px;
    font-weight: 700;
  }
`

const Profile = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  padding: 20px;
  border-radius: 12px;
  background: #fff4ef;

  dt {
    font-size: 13px;
    color: #888;
  }

  dd {
    font-weight: 700;
    word-break: break-all;
  }
`

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    font-weight: 700;
  }

  input {
    height: 44px;
    padding: 0 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-weight: 400;
  }

  .hint {
    font-size: 13px;
    color: #888;
  }

  button {
    height: 44px;
    border-radius: 8px;
    background: ${MAIN_COLOR};
    color: #fff;
    font-weight: 700;
  }

  &.danger button {
    background: #e03131;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
`

const ReviewList = styled.ul`
  li {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 14px;
  }

  .head a {
    color: ${MAIN_COLOR};
    font-weight: 700;
  }

  .date {
    color: #999;
  }
`

const Empty = styled.p`
  color: #888;
`

const formatDate = (date) => new Date(date).toLocaleDateString('ko-KR')

function MyPage() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [myRestaurants, setMyRestaurants] = useState([])
  const [myReviews, setMyReviews] = useState([])

  const [editForm, setEditForm] = useState({ nickname: user?.nickname || '', currentPassword: '', newPassword: '' })
  const [editError, setEditError] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')

  // 프로필, 내 맛집, 내 리뷰를 함께 불러옴
  useEffect(() => {
    if (!user) return
    Promise.all([api.get('/users/me'), api.get('/users/me/restaurants'), api.get('/users/me/reviews')])
      .then(([profileRes, restaurantsRes, reviewsRes]) => {
        setProfile(profileRes.data)
        setMyRestaurants(restaurantsRes.data)
        setMyReviews(reviewsRes.data)
      })
      .catch(() => {
        // 토큰이 만료됐거나 회원 정보가 없으면 다시 로그인
        alert('로그인 정보가 만료되었습니다. 다시 로그인해주세요.')
        logout()
        navigate('/login')
      })
  }, [user, logout, navigate])

  if (!user) return <Navigate to="/login" replace />

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  // 프로필 수정 (Update)
  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put('/users/me', editForm)
      login(res.data.token, res.data.user) // 바뀐 닉네임으로 로그인 정보 갱신
      setEditForm({ nickname: res.data.user.nickname, currentPassword: '', newPassword: '' })
      setEditError('')
      alert(res.data.message)
    } catch (err) {
      setEditError(err.response?.data?.message || '수정에 실패했습니다.')
    }
  }

  // 회원 탈퇴 (Delete)
  const handleDelete = async (e) => {
    e.preventDefault()
    if (!confirm('정말 탈퇴할까요? 등록한 맛집과 리뷰가 모두 삭제되며 되돌릴 수 없습니다.')) return
    try {
      await api.delete('/users/me', { data: { password: deletePassword } })
      logout()
      alert('회원 탈퇴가 완료되었습니다.')
      navigate('/')
    } catch (err) {
      setDeleteError(err.response?.data?.message || '탈퇴에 실패했습니다.')
    }
  }

  if (!profile) return <p>불러오는 중...</p>

  return (
    <Wrapper>
      <h1>마이페이지</h1>

      <section>
        <h2>내 정보</h2>
        <Profile as="dl">
          <div>
            <dt>이메일</dt>
            <dd>{profile.email}</dd>
          </div>
          <div>
            <dt>닉네임</dt>
            <dd>{profile.nickname}</dd>
          </div>
          <div>
            <dt>가입일</dt>
            <dd>{formatDate(profile.created_at)}</dd>
          </div>
          <div>
            <dt>등록한 맛집</dt>
            <dd>{profile.restaurant_count}개</dd>
          </div>
          <div>
            <dt>작성한 리뷰</dt>
            <dd>{profile.review_count}개</dd>
          </div>
        </Profile>
      </section>

      <section>
        <h2>내 정보 수정</h2>
        <EditForm onSubmit={handleEdit}>
          <label>
            닉네임
            <input name="nickname" value={editForm.nickname} onChange={handleEditChange} maxLength={30} required />
          </label>
          <label>
            새 비밀번호
            <input name="newPassword" type="password" value={editForm.newPassword} onChange={handleEditChange} />
          </label>
          {editForm.newPassword && (
            <label>
              현재 비밀번호
              <input name="currentPassword" type="password" value={editForm.currentPassword} onChange={handleEditChange} required />
            </label>
          )}
          <p className="hint">비밀번호를 바꾸지 않으려면 새 비밀번호를 비워두세요.</p>
          {editError && <ErrorText>{editError}</ErrorText>}
          <button type="submit">수정하기</button>
        </EditForm>
      </section>

      <section>
        <h2>내가 등록한 맛집 {myRestaurants.length}</h2>
        {myRestaurants.length === 0 ? (
          <Empty>
            아직 등록한 맛집이 없어요. <Link to="/restaurants/new">맛집 등록하기</Link>
          </Empty>
        ) : (
          <Grid>
            {myRestaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </Grid>
        )}
      </section>

      <section>
        <h2>내가 쓴 리뷰 {myReviews.length}</h2>
        {myReviews.length === 0 ? (
          <Empty>아직 작성한 리뷰가 없어요.</Empty>
        ) : (
          <ReviewList>
            {myReviews.map((review) => (
              <li key={review.id}>
                <div className="head">
                  <Link to={`/restaurants/${review.restaurant_id}`}>{review.restaurant_name}</Link>
                  <StarRating value={review.rating} size={14} />
                  <span className="date">{formatDate(review.created_at)}</span>
                </div>
                <p>{review.content}</p>
              </li>
            ))}
          </ReviewList>
        )}
      </section>

      <section>
        <h2>회원 탈퇴</h2>
        <EditForm className="danger" onSubmit={handleDelete}>
          <p className="hint">탈퇴하면 등록한 맛집과 리뷰가 모두 삭제됩니다.</p>
          <label>
            비밀번호 확인
            <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required />
          </label>
          {deleteError && <ErrorText>{deleteError}</ErrorText>}
          <button type="submit">회원 탈퇴</button>
        </EditForm>
      </section>
    </Wrapper>
  )
}

export default MyPage
