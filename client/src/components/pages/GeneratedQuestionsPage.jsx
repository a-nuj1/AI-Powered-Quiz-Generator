import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate for redirection

const GeneratedQuestionsPage = () => {
  const location = useLocation();
  const { questions = [] } = location.state || {};
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    // Method to filter out invalid questions
    const validateQuestions = (questions) => {
      const questionRegex = /^Q\d+\s*-\s*\*\*\d+\s*-.*\*\*/; // Update based on your AI response format
      return questions.filter((question) => {
        // Ensure the question has valid properties and fits the expected structure
        return (
          question &&
          question.question &&
          Array.isArray(question.options) &&
          question.options.length > 0 &&
          typeof question.answer === "string" &&
          !questionRegex.test(question.question) // Exclude prompts like "Q1, Q2, etc."
        );
      });
    };

    if (questions.length > 0) {
      const validQuestions = validateQuestions(questions);
      setFilteredQuestions(validQuestions);
      setLoading(false);
    }
  }, [questions]);

  // Function to navigate to the quiz page
  const handleStartQuiz = () => {
    navigate("/quiz"); // Redirect to the quiz page
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-100 p-6 relative">
      {/* Take a Quiz Button */}
      <button
        onClick={handleStartQuiz}
        className="absolute top-6 right-6 bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md"
      >
        Take a Quiz
      </button>

      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        AI-Generated Questions
      </h1>
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-6">
        {loading ? (
          <p className="text-gray-600 text-center">
            Your questions are being generated, please wait...
          </p>
        ) : filteredQuestions.length ? (
          filteredQuestions.map((question, index) => (
            <div
              key={index}
              className="p-4 bg-blue-50 border-l-4 border-blue-500 shadow"
            >
              <p className="text-lg font-semibold text-gray-800">
                Q-{question.question}
              </p>
              <div className="pl-6 mt-2 space-y-1">
                {question.options.map((option, i) => (
                  <p key={i} className="text-gray-700">
                    {option}
                  </p>
                ))}
              </div>
              <p className="text-green-600 font-bold mt-2">
                Answer: {question.answer}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center">
            No valid questions generated.
          </p>
        )}
      </div>
    </div>
  );
};

export default GeneratedQuestionsPage;
