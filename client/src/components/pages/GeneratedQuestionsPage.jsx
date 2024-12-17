import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const GeneratedQuestionsPage = () => {
  const location = useLocation();
  const { questions = [] } = location.state || {};
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (questions.length > 0) {
      setLoading(false); 
    }
  }, [questions]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">AI-Generated Questions</h1>
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-4">
        {loading ? (
          <p className="text-gray-600 text-center">Your question is being generated, please wait...</p>
        ) : (
          questions.length ? (
            questions.map((question, index) => (
              <div key={index} className="p-4 bg-blue-50 border-l-4 border-blue-500 shadow">
                <p className="text-lg font-medium text-gray-800">{question.Q}</p> {/* Render the question */}
                <p className="text-sm text-gray-600">{question.A}</p> {/* Render the answer */}
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center">No questions generated yet.</p>
          )
        )}
      </div>
    </div>
  );
};

export default GeneratedQuestionsPage;
