import pdfDetails from "../models/pdfDetails.js";
import { v2 as cloudinary } from "cloudinary";
import pdfParse from "pdf-parse";
import axios from "axios";

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

    if (cloudinaryResponse.result !== "ok" && cloudinaryResponse.result !== "not_found") {
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
    return res.status(400).json({ error: 'PDF URL is required' });
  }

  try {
    // Fetch the PDF from the provided URL
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer', // Ensure binary data
    });

    // Parse the PDF content
    const pdfData = await pdfParse(response.data);

    // Return the extracted text
    res.status(200).json({ text: pdfData.text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse the PDF' });
  }
};


export { uploadPDF, getPDF, deletePDF, viewPDF, parsePDF};
