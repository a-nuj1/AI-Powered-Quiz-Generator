import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';


// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './files');
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() 
//         cb(null, uniqueSuffix + file.originalname);
//     }
// });

// const upload = multer({
//     storage: storage,
// });


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
});


export default upload;