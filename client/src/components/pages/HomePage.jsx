import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { server } from "./Home";
import { SiOpenai } from "react-icons/si";

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState("");
  const [parsedText, setParsedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.pdfUrl) {
      setPdfUrl(location.state.pdfUrl);
    }
  }, [location.state]);

  useEffect(() => {
    if (pdfUrl) {
      handleParse();
    }
  }, [pdfUrl]);

  const handleParse = async () => {
    try {
      const response = await axios.post(`${server}/api/parse-pdf`, {
        pdfUrl,
      });

      setParsedText(response.data.text);
    } catch (error) {
      alert("Failed to parse the PDF");
    }
  };

  // Function to clean and format parsed text with margins adjustments
  const formatParsedText = (text) => {
    const lines = text.split("\n"); // Split text into lines
    const filteredLines = lines.filter((line) => {
      // Remove lines that look like page numbers
      return !line.match(/^\d+\s*\|\s*Page/i);
    });

    const formattedText = filteredLines.map((line, index) => {
      // Check if the line looks like a question
      if (
        line.trim().endsWith("?") || // Ends with ?
        line.match(/^\d+[\).\s]/) || // Starts with a number (e.g., "32) ")
        line.match(/^(Explain|Define|What|Why|How|Describe|List)/i) // Common question starters
      ) {
        return (
          <div key={index} className="mb-2">
            <p className="font-bold text-lg text-gray-800">{line.trim()}</p>
          </div>
        );
      } else if (line.trim().startsWith("Option")) {
        // Format options
        return (
          <div key={index} className="ml-6 mb-1">
            <p className="text-gray-600">{line.trim()}</p>
          </div>
        );
      } else {
        // Format answers or normal text
        return (
          <div key={index} className="ml-4 mb-1">
            <p className="text-gray-700">{line.trim()}</p>
          </div>
        );
      }
    });

    return formattedText;
  };

  const handleGenerateAIQuestions = async () => {
    // Navigate immediately to the "Generate Similar Questions" page
    navigate("/similar-questions", { state: { generating: true } });

    try {
      // Simulate the generation process in the background
      const response = await axios.post(`${server}/api/generate-questions`, {
        text: parsedText,
      });
      // Once questions are generated, update the state with the questions
      navigate("/similar-questions", { state: { questions: response.data.questions } });
    } catch (error) {
      console.error("Error generating AI questions:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to generate similar questions");
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 px-4">

      <button
        onClick={handleGenerateAIQuestions}
        className="absolute top-4 right-4 flex items-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition space-x-2"
      >
        <SiOpenai className="text-xl" /> 
        <span>Generate Similar Questions Using AI</span>
      </button>

      <div className="mt-16">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-5">
          Your Questions
        </h1>
      </div>

      {/* Hidden Input for PDF URL */}
      <input type="text" value={pdfUrl} style={{ display: "none" }} readOnly />

      {/* Parsed Text Display */}
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        {parsedText ? (
          <div className="text-gray-800">{formatParsedText(parsedText)}</div>
        ) : (
          <p className="text-gray-600">Parsing PDF...</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
