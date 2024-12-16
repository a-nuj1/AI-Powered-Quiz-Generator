# AI-Powered-Quiz-Generator

This web application allows users to upload PDF-based question papers, parse the content to extract questions, generate AI-powered similar questions, and create interactive quizzes. The project leverages modern technologies like React.js, Node.js, and OpenAI's API to deliver an engaging and intelligent quiz experience.

## Overview
The project aims to streamline quiz creation by integrating PDF parsing, AI-based question generation, and an interactive web-based quiz interface. Users can upload a question paper in PDF format, extract questions from it, generate similar questions using AI, and present them in a quiz format. Key features include:

- **PDF Upload and Parsing**: Upload a PDF, extract text, and identify questions.
- **AI-Based Question Generation**: Generate contextually relevant questions using OpenAI's API.
- **Interactive Quiz**: A user-friendly interface for taking quizzes, with features like multiple-choice questions, timers, and score calculation.

## Tech Stack

### Frontend
- **React.js**: For building the user interface.
- **TailwindCSS**: For styling and responsive design.

### Backend
- **Node.js**: For server-side logic.
- **Express.js**: For building RESTful APIs.

### Database
- **MongoDB**: For storing user and quiz data.

### AI Integration
- **OpenAI API**: For generating AI-powered similar questions.

### PDF Parsing
- **pdf-parse**: For extracting text from uploaded PDF files.

## Project Structure
```
project-root/
├── client/               # Frontend code (React.js)
│   ├── public/           # Public assets
│   ├── src/              # React components and hooks
│   └── package.json      # Frontend dependencies
├── server/               # Backend code (Node.js, Express.js)
│   ├── routes/           # API routes
│   ├── models/           # Database models
│   ├── utils/            # Helper functions (e.g., PDF parsing)
│   └── package.json      # Backend dependencies
├── .env                  # Environment variables
├── README.md             # Project documentation
└── package.json          # Root dependencies
```

## Getting Started

### Prerequisites
Ensure you have the following installed:
- Node.js
- npm (or yarn)
- MongoDB (or access to a hosted MongoDB instance)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pdf-quiz-app.git
   cd pdf-quiz-app
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `server` directory with the following variables:
     ```
     PORT=8000
     MONGO_URI=<your_mongo_database_uri>
     OPENAI_API_KEY=<your_openai_api_key>
     ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

3. Open the application in your browser at [http://localhost:5173](http://localhost:8000).

## Usage

1. Upload a PDF file containing a question paper.
2. Extract questions and generate similar ones using AI.
3. Take the generated quiz using the interactive interface.

## Future Enhancements
- Improve question parsing accuracy.
- Add support for additional file formats.
- Integrate user authentication and quiz history tracking.


