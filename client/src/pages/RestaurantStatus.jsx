import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import api from '../api/axios.js'
import { MAIN_COLOR } from '../constants.js'

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;

  h1 {
    font-size: 26px;
    font-weight: 700;
  }

  .desc {
    margin: 4px 0 20px;
    font-size: 14px;
    color: #888;
  }
`

const TableWrap = styled.div`
  overflow-x: auto;
`

const Table = styled.table`
  width: 100%;
  min-width: 600px;
  font-size: 14px;

  th,
  td {
    padding: 12px 8px;
    border-bottom: 1px solid #eee;
    text-align: left;
  }

  th {
    background: #fafafa;
    font-weight: 700;
    white-space: nowrap;
  }

  td a {
    color: ${MAIN_COLOR};
    font-weight: 700;
  }
`

const Empty = styled.p`
  padding: 60px 0;
  color: #888;
  text-align: center;
`

const formatDate = (date) => new Date(date).toLocaleDateString('ko-KR')

// [JOIN 조회 메뉴] 맛집 등록 현황
// 서버에서 restaurants(맛집) + users(회원) 두 테이블을 JOIN한 결과를 표로 보여줌
function RestaurantStatus() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/restaurant-status')
      .then((res) => setList(res.data))
      .catch(() => alert('맛집 등록 현황을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Wrapper>
      <h1>맛집 등록 현황</h1>
      <p className="desc">어떤 회원이 어떤 맛집을 등록했는지 볼 수 있어요. (총 {list.length}개)</p>

      {loading ? (
        <Empty>불러오는 중...</Empty>
      ) : list.length === 0 ? (
        <Empty>아직 등록된 맛집이 없어요.</Empty>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>맛집 이름</th>
                <th>카테고리</th>
                <th>주소</th>
                <th>등록한 회원</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link to={`/restaurants/${r.id}`}>{r.name}</Link>
                  </td>
                  <td>{r.category}</td>
                  <td>{r.address}</td>
                  <td>{r.nickname}</td>
                  <td>{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </Wrapper>
  )
}

export default RestaurantStatus
