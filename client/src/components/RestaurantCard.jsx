import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { IoRestaurant } from 'react-icons/io5'
import StarRating from './StarRating.jsx'
import { MAIN_COLOR } from '../constants.js'

const Card = styled(Link)`
  display: block;
  overflow: hidden;
  border: 1px solid #eee;
  border-radius: 12px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
`

const Thumb = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 4 / 3;
  background: #fff4ef;
  color: ${MAIN_COLOR};
  font-size: 48px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const Info = styled.div`
  padding: 14px;

  .category {
    font-size: 13px;
    color: ${MAIN_COLOR};
    font-weight: 700;
  }

  h3 {
    margin: 2px 0 4px;
    font-size: 18px;
    font-weight: 700;
  }

  .address {
    overflow: hidden;
    font-size: 14px;
    color: #888;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 14px;
    color: #555;
  }
`

function RestaurantCard({ restaurant }) {
  const { id, name, category, address, image, avg_rating, review_count } = restaurant

  return (
    <Card to={`/restaurants/${id}`}>
      <Thumb>{image ? <img src={image} alt={name} /> : <IoRestaurant />}</Thumb>
      <Info>
        <span className="category">{category}</span>
        <h3>{name}</h3>
        <p className="address">{address}</p>
        <div className="rating">
          <StarRating value={avg_rating || 0} size={14} />
          {review_count > 0 ? `${avg_rating} (${review_count})` : '아직 리뷰가 없어요'}
        </div>
      </Info>
    </Card>
  )
}

export default RestaurantCard
