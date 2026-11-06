import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.js'
import { ErrorText } from '../components/AuthForm.jsx'
import { CATEGORIES, MAIN_COLOR } from '../constants.js'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 560px;
  margin: 20px auto;

  h2 {
    font-size: 26px;
    font-weight: 700;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
    font-weight: 700;
  }

  input,
  select,
  textarea {
    padding: 12px 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-weight: 400;
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }

  .preview {
    width: 200px;
    border-radius: 8px;
  }

  button[type='submit'] {
    height: 48px;
    border-radius: 8px;
    background: ${MAIN_COLOR};
    color: #fff;
    font-weight: 700;
  }
`

const EMPTY_FORM = { name: '', category: '한식', address: '', phone: '', description: '' }

// 맛집 등록 (/restaurants/new) 과 수정 (/restaurants/:id/edit) 에서 함께 사용
function RestaurantForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
  const userId = user?.id
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  // 수정일 때는 기존 정보를 불러와서 채워줌
  useEffect(() => {
    if (!isEdit || !userId) return
    api
      .get(`/restaurants/${id}`)
      .then(({ data }) => {
        // 주소를 직접 입력해서 들어와도 본인 맛집이 아니면 수정 화면을 보여주지 않음
        if (data.user_id !== userId) {
          alert('본인이 등록한 맛집만 수정할 수 있습니다.')
          navigate(`/restaurants/${id}`, { replace: true })
          return
        }
        setForm({
          name: data.name,
          category: data.category,
          address: data.address,
          phone: data.phone || '',
          description: data.description || '',
        })
        setPreview(data.image)
      })
      .catch(() => {
        alert('맛집 정보를 불러오지 못했습니다.')
        navigate('/')
      })
  }, [id, isEdit, navigate, userId])

  if (!user) return <Navigate to="/login" replace />

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    setImageFile(file || null)
    if (file) setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 사진 파일을 함께 보내기 위해 FormData 사용
    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => data.append(key, value))
    if (imageFile) data.append('image', imageFile)

    try {
      if (isEdit) {
        await api.put(`/restaurants/${id}`, data)
        navigate(`/restaurants/${id}`)
      } else {
        const res = await api.post('/restaurants', data)
        navigate(`/restaurants/${res.data.id}`)
      }
    } catch (err) {
      setError(err.response?.data?.message || '저장에 실패했습니다.')
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <h2>{isEdit ? '맛집 수정' : '맛집 등록'}</h2>

      <label>
        가게 이름 *
        <input name="name" value={form.name} onChange={handleChange} maxLength={100} required />
      </label>

      <label>
        카테고리 *
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label>
        주소 *
        <input name="address" value={form.address} onChange={handleChange} maxLength={255} required />
      </label>

      <label>
        전화번호
        <input name="phone" value={form.phone} onChange={handleChange} maxLength={20} placeholder="02-123-4567" />
      </label>

      <label>
        소개
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="추천 메뉴, 가격대 등" />
      </label>

      <label>
        사진
        <input type="file" accept="image/*" onChange={handleImage} />
      </label>
      {preview && <img className="preview" src={preview} alt="미리보기" />}

      {error && <ErrorText>{error}</ErrorText>}
      <button type="submit">{isEdit ? '수정하기' : '등록하기'}</button>
    </Form>
  )
}

export default RestaurantForm
