import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/pages/Home'
import HomePage from './components/pages/HomePage';
import GeneratedQuestionsPage from './components/pages/GeneratedQuestionsPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/similar-questions" element={<GeneratedQuestionsPage />} />
      </Routes>
    </Router>
  )
}

export default App