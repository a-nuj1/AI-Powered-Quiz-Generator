import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 

const ResultPage = () => {
  const { state } = useLocation(); // Get the state  passed from the QuizPage
  const [score, setScore] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (state && state.score !== undefined) {
      setScore(state.score); // Set the score passed from the quiz page
    }
  }, [state]);

  // Function to restart the quiz
  const handleRestart = () => {
    setScore(null); // Reset the score
    navigate('/quiz'); // Navigate back to the QuizPage to restart the quiz
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6">Quiz Results</h1>
      <div className="max-w-md mx-auto bg-white p-6 shadow rounded text-center">
        {score !== null ? (
          <p className="text-2xl font-semibold">Your Score: {score}</p>
        ) : (
          <p>Loading...</p>
        )}
        <button
          onClick={handleRestart}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded"
        >
          Restart Quiz
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
