import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NotFound from './pages/NotFound.jsx'
import RestaurantDetail from './pages/RestaurantDetail.jsx'
import RestaurantForm from './pages/RestaurantForm.jsx'
import MyPage from './pages/MyPage.jsx'
import ReviewFeed from './pages/ReviewFeed.jsx'
import RestaurantStatus from './pages/RestaurantStatus.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/restaurants/new" element={<RestaurantForm />} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        <Route path="/restaurants/:id/edit" element={<RestaurantForm />} />
        <Route path="/status" element={<RestaurantStatus />} />
        <Route path="/reviews" element={<ReviewFeed />} />
        <Route path="/mypage" element={<MyPage />} />
        {/* 페이지를 추가할 때 여기에 Route를 등록 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
