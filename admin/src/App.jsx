import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ListMoviesPage from './components/ListMoviesPage'
import Dashboard from './pages/Dashboard'
import BookingPage from './pages/BookingPage'

const App = () => {
  return (
   <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/listmovies" element={<ListMoviesPage/>}/>
    <Route path="/dashboard" element={<Dashboard/>}/>
    <Route path="/bookings" element={<BookingPage/>}/>
   </Routes>
  )
}

export default App
