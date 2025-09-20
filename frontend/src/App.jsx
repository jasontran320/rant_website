import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import './styles/main.css'
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Post from './pages/Post.jsx'

function App() {
  
  return (
    <Router>
      <Header />
      <div className="main-app">
        <main className="pages">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/post/:id" element={<Post />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App