import express from 'express';
import { deletePDF, generateAIQuestions, getPDF, parsePDF, uploadPDF, viewPDF } from '../controllers/pdfController.js';
import upload from '../middlwares/multer.js';

const app = express.Router();

// upload pdf file
app.post('/uploadpdf',upload.single("file") ,uploadPDF);

// get pdf file
app.get('/getpdf',getPDF);

// view single pdf file
app.get('/files/:id', viewPDF);

// delete pdf file
app.delete('/deletepdf/:id',deletePDF);

// Parse PDF
app.post('/parse-pdf', parsePDF);

// Generate AI Questions
app.post("/generate-questions", generateAIQuestions);

export default app;

