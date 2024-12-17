import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirecting
import { server } from './Home';

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]); // This will hold answers
  const [timer, setTimer] = useState(45);
  const [quizCompleted, setQuizCompleted] = useState(false); // Track quiz completion
  const navigate = useNavigate(); // Initialize navigate hook

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`${server}/api/questions`);
        setQuestions(res.data.questions); // Assuming response contains `questions`
      } catch (error) {
        console.error("Error in fetching questions:", error);
      }
    };
    fetchQuestions();
  }, []);

  // Timer functionality, countdown and move to next question automatically
  useEffect(() => {
    if (timer === 0) {
      handleNext();
    }
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [timer]);

  // Handle next question logic
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Move to the next question
      setCurrentQuestionIndex(prev => prev + 1);
      setTimer(45); // Reset timer for the next question
    } else {
      // If it's the last question, complete the quiz
      setQuizCompleted(true);
      handleSubmit(); // Submit quiz after the last question
    }
  };

  // Handle user's answer selection
  const handleOptionChange = (option) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentQuestionIndex] = option; // Store the answer for this question index
    console.log(updatedAnswers);
    setSelectedAnswers(updatedAnswers);
  };

  // Submit answers when quiz is completed and navigate to result page
  const handleSubmit = async () => {
    try {
      // Send answers to the backend to calculate score
      const res = await axios.post(`${server}/api/calculate-score`, { userAnswers: selectedAnswers });
      const { score } = res.data; // Assuming backend returns score

      // Redirect to the result page with the score
      navigate('/result', { state: { score } });
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6">Quiz Application</h1>
      <div className="max-w-3xl mx-auto bg-white p-6 shadow rounded">
        {quizCompleted ? (
          <p className="text-center text-lg">Quiz completed! Submitting your answers...</p>
        ) : (
          <>
            {questions.length > 0 && currentQuestionIndex < questions.length ? (
              <div>
                <p className="text-xl font-semibold">
                  {`Q${currentQuestionIndex + 1}: ${questions[currentQuestionIndex].question}`}
                </p>
                <div className="mt-4 space-y-2">
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <label key={index} className="block">
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={option}
                        onChange={() => handleOptionChange(option)} // Update answer immediately
                        className="mr-2"
                        checked={selectedAnswers[currentQuestionIndex] === option} // Check if this option is selected
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-lg">Loading questions...</p>
            )}

            <div className="flex justify-between items-center mt-6">
              <p className="text-gray-500 font-bold ">Time left: {timer} seconds</p>
              <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">
                {currentQuestionIndex < questions.length - 1 ? "Next" : "Finish Quiz"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
