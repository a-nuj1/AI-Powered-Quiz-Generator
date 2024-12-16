import mongoose from "mongoose";

const pdfDetailsSchema = new mongoose.Schema({
    pdf: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
});

const pdfDetails = mongoose.model("pdfDetails", pdfDetailsSchema);

export default pdfDetails;