import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/pages/Home'
import HomePage from './components/pages/HomePage';
import GeneratedQuestionsPage from './components/pages/GeneratedQuestionsPage';
import QuizPage from './components/pages/QuizPage';
import ResultPage from './components/pages/ResultPage';


function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/similar-questions" element={<GeneratedQuestionsPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        
      </Routes>
    </Router>
  )
}

export default App