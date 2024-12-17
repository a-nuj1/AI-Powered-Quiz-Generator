import pdfDetails from "../models/pdfDetails.js";
import { v2 as cloudinary } from "cloudinary";
import pdfParse from "pdf-parse";
import axios from "axios";
import OpenAI from "openai";
import dotenv from "dotenv";
import Question from "../models/question.js";
dotenv.config();

const uploadPDF = (req, res) => {
  try {
    const file = req.file;
    const { title } = req.body;

    if (!file) {
      return res.status(400).send("No file uploaded");
    }
    if (!title) {
      return res.status(400).send("Title is required");
    }

    // Upload the file to Cloudinary
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: "pdfs",
          access_mode: "public",
        },
        async (error, result) => {
          if (error) {
            return res
              .status(500)
              .send(`Error uploading to Cloudinary: ${error.message}`);
          }

          // Save the file URL and title to MongoDB
          const newPDF = new pdfDetails({
            pdf: result.secure_url,
            title: title,
          });

          // Save to the database
          try {
            const savedPDF = await newPDF.save();
            return res
              .status(200)
              .json({ message: "PDF uploaded successfully", pdf: savedPDF });
          } catch (dbError) {
            return res.status(500).send("Error saving PDF details to database");
          }
        }
      )
      .end(file.buffer); // Pipe the file buffer to Cloudinary
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

const getPDF = async (req, res) => {
  try {
    const files = await pdfDetails.find();
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const viewPDF = async (req, res) => {
  try {
    const fileName = req.params.id; // Get the file name from the URL parameter

    // Find the file in the database by the 'pdf' field (Cloudinary URL in your case)
    const file = await pdfDetails.findOne({
      pdf: { $regex: fileName, $options: "i" },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Return the Cloudinary URL directly
    res.status(200).json({ pdfUrl: file.pdf }); // Assuming file.pdf stores the Cloudinary URL
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deletePDF = async (req, res) => {
  try {
    const id = req.params.id; // Extract `id` from request parameters

    // Find the file in MongoDB
    const file = await pdfDetails.findById(id);
    if (!file) {
      return res.status(404).json({ message: "File not found in database" });
    }

    // Extract the public_id from the Cloudinary URL
    const pdfUrl = file.pdf;
    const urlSegments = pdfUrl.split("/");
    const public_id = urlSegments.slice(-2).join("/").split(".")[0];

    // Delete from Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.destroy(public_id, {
      resource_type: "image", // Correct resource type for PDFs
    });

    if (
      cloudinaryResponse.result !== "ok" &&
      cloudinaryResponse.result !== "not_found"
    ) {
      return res
        .status(500)
        .json({ message: "Failed to delete file from Cloudinary" });
    }

    // Delete from MongoDB
    await file.deleteOne();

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error in deletePDF:", {
      id: req.params?.id || "No ID Provided",
      error: error.message || error,
    });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const parsePDF = async (req, res) => {
  const { pdfUrl } = req.body;

  if (!pdfUrl) {
    return res.status(400).json({ error: "PDF URL is required" });
  }

  try {
    // Fetch the PDF from the provided URL
    const response = await axios.get(pdfUrl, {
      responseType: "arraybuffer", // Ensure binary data
    });

    // Parse the PDF content
    const pdfData = await pdfParse(response.data);

    // Return the extracted text
    res.status(200).json({ text: pdfData.text });
  } catch (error) {
    res.status(500).json({ error: "Failed to parse the PDF" });
  }
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateAIQuestions = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res
      .status(400)
      .json({ message: "Text is required for question generation." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for generating educational questions.",
        },
        {
          role: "user",
          content: `I am providing a set of educational questions. Please generate 10 new multiple-choice questions that are similar in difficulty and topic. Each question should have 4 options (a, b, c, d) and an answer. Format the questions as follows:\n a. Option 1\n    b. Option 2\n    c. Option 3\n    d. Option 4\nAnswer: Option \n\nHere are the sample questions:\n\n${text}\n\nPlease generate 10 new similar questions.`,
        },
      ],
      max_tokens: 2480,
      temperature: 1,
    });

    const formattedQuestions = completion.choices[0].message.content
      .trim()
      .split("\n\n")
      .map((block, index) => {
        // Split the block into lines
        const lines = block.split("\n");

        // The first line is the question, which starts with "Q"
        const questionLine = lines[0].replace(/^Q\d+\s*-\s*/, "").trim();  // Removes the "Q1 - " part

        // The next 4 lines are options
        const options = lines.slice(1, 5).map(opt => opt.trim());

        // The last line is the answer
        const answerLine = lines[5]?.replace("Answer:", "").trim();

        return {
          // id: index + 1,
          question: questionLine,
          options: options,
          answer: answerLine,
        };
      });

    // Validate the questions
    const validateQuestions = (questions) => {
      return questions.filter((q) => {
        if (!q.question || typeof q.question !== "string" || q.question.trim() === "") {
          return false;
        }

        if (!Array.isArray(q.options) || q.options.length !== 4 || !q.options.every((opt) => typeof opt === "string" && opt.trim() !== "")) {
          return false;
        }

        if (!q.answer || typeof q.answer !== "string" || q.answer.trim() === "") {
          return false;
        }

        return true;  // Valid question
      });
    };

    const validQuestions = validateQuestions(formattedQuestions);
    // console.log(validQuestions);

      // Save questions to the database
      await Question.insertMany(validQuestions);


    res.status(200).json({ questions: validQuestions });
  } catch (error) {
    console.error("Error generating AI questions:", error.message);
    res.status(500).json({ message: "Failed to generate questions" });
  }
};


// save generated questions to database
// const saveQuestions = async (req, res) => {
//   const { questions } = req.body;

//   if (!questions || !Array.isArray(questions) || questions.length === 0) {
//     return res.status(400).json({ message: "Questions are required" });
//   }

//   try {
//     const savedQuestions = await Question.insertMany(questions);
//     res.status(200).json({
//       questions: savedQuestions,
//       message: "Questions saved successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to save questions",
//       error: error.message,
//     });
//   }
// };


// get generated questions from database
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json({ 
      questions,
      message: "Questions fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to get questions",
      error: error.message,

     });
  }
};


// calculate score
const calculateScore = async (req, res) => {
  const {userAnswers} = req.body;

  if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length === 0) {
    return res.status(400).json({ message: "User answers are required" });
  }

  try {
    const questions = await Question.find();
    let score = 0;
    questions.forEach((question, index) => {
      if (question.answer === userAnswers[index]) {
        score += 1;
      }
    });

    res.status(200).json({ 
      score, 
      message: "Score calculated successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to calculate score", 
      error: error.message 
    });
  }
};




export { uploadPDF, getPDF, deletePDF, viewPDF, parsePDF, generateAIQuestions, getQuestions,calculateScore };
