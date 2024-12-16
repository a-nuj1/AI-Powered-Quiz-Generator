import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './database/db.js';
import pdfRoutes from "./routes/routes.js";
import multer from "./middlwares/multer.js";

import {v2 as cloudinary} from 'cloudinary'

dotenv.config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(express.static('files'));
app.use(express.urlencoded({ extended: true }));


// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        process.env.CLIENT_URL,
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

// Routes
app.use('/api', pdfRoutes);


// Default Route
app.get('/', (req, res) => {
  res.send('Welcome! Server is up and running.');
});

// Connect to DB and Start Server
connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
