import React from 'react'
import Navbar from '../Components/Navbar'
import Banner from '../Components/Banner'
import Movies from '../Components/Movies'
import Trailers from '../Components/Trailers'
import News from '../Components/News'
import Footer from '../Components/Footer'

const Home = () => {
  return (
    <div>
      <Navbar/>
      <Banner/>
      <Movies/>
      <Trailers/>
      <News/>
      <Footer/>
    </div>
  )
}

export default Home
