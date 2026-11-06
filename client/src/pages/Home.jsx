import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { IoSearch } from 'react-icons/io5'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.js'
import RestaurantCard from '../components/RestaurantCard.jsx'
import { CATEGORIES, MAIN_COLOR } from '../constants.js'

const Top = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;

  h1 {
    font-size: 26px;
    font-weight: 700;
  }
`

const AddButton = styled(Link)`
  padding: 10px 18px;
  border-radius: 8px;
  background: ${MAIN_COLOR};
  color: #fff;
  font-weight: 700;
`

const SearchForm = styled.form`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;

  input {
    flex: 1;
    height: 44px;
    padding: 0 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  button {
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-radius: 8px;
    background: #333;
    color: #fff;
    font-size: 20px;
  }
`

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;

  button {
    padding: 6px 14px;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 14px;
  }

  button.active {
    border-color: ${MAIN_COLOR};
    background: ${MAIN_COLOR};
    color: #fff;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
`

const Empty = styled.p`
  padding: 60px 0;
  color: #888;
  text-align: center;
`

function Home() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [category, setCategory] = useState('')
  const [keyword, setKeyword] = useState('') // 입력 중인 검색어
  const [query, setQuery] = useState('') // 실제로 검색한 검색어
  const [loading, setLoading] = useState(true)

  // 카테고리나 검색어가 바뀌면 목록을 다시 불러옴
  useEffect(() => {
    api
      .get('/restaurants', { params: { category: category || undefined, q: query || undefined } })
      .then((res) => setRestaurants(res.data))
      .catch(() => alert('맛집 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [category, query])

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(keyword.trim())
  }

  return (
    <>
      <Top>
        <h1>학교앞 맛집</h1>
        {user && <AddButton to="/restaurants/new">+ 맛집 등록</AddButton>}
      </Top>

      <SearchForm onSubmit={handleSearch}>
        <input
          placeholder="가게 이름이나 주소로 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="submit" aria-label="검색">
          <IoSearch />
        </button>
      </SearchForm>

      <Tabs>
        {['', ...CATEGORIES].map((c) => (
          <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>
            {c || '전체'}
          </button>
        ))}
      </Tabs>

      {loading ? (
        <Empty>불러오는 중...</Empty>
      ) : restaurants.length === 0 ? (
        <Empty>등록된 맛집이 없어요.</Empty>
      ) : (
        <Grid>
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </Grid>
      )}
    </>
  )
}

export default Home
