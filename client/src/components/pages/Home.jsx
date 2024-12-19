import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { MdDeleteForever } from "react-icons/md";
import { useNavigate } from "react-router-dom"; 

function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploads, setUploads] = useState([]);
  const [title, setTitle] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); 

  // hadle file change and set the message accordingly

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setMessage("File selected successfully!");
    } else {
      setMessage("Please upload a valid PDF file.");
    }
  };

  // handle the upload of the file and set the message accordingly

  const handleUpload = async () => {
    if (!title.trim()) {
      setMessage("Please enter a title!");
      return;
    }
    if (pdfFile) {
      setMessage("Uploading...");
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("title", title);

      try {
        const response = await axios.post(`${server}/api/uploadpdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status === 200) {
          const newFile = { ...response.data, _id: Date.now() };
          setUploads((prevUploads) => [...prevUploads, newFile]);
          setMessage("File uploaded successfully!");
          setTitle("");
          setPdfFile(null);

          // Reset the file input field using ref
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          setMessage("Failed to upload file.");
        }
      } catch (err) {
        setMessage("Error uploading file.");
      }
    } else {
      setMessage("Please select a file!");
    }
  };


  // view the file in a new tab
  const viewHandler = async (id) => {
    try {
      if (typeof id !== "string") {
        alert("Invalid ID.");
        return;
      }

     
      const fileName = id.split("/").pop();
      // console.log(fileName);
      const response = await axios.get(`${server}/api/files/${fileName}`);

      if (response.data.pdfUrl) {
        window.open(response.data.pdfUrl, "_blank", "noreferrer");
      } else {
        alert("PDF not found.");
      }
    } catch (error) {
      alert("Error opening PDF.");
    }
  };

  // handle the delete of the file and set the message accordingly
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${server}/api/deletepdf/${id}`);

      if (response.status === 200) {
        setUploads(uploads.filter((file) => file._id !== id));
        alert("File deleted successfully!");
      } else {
        alert("Failed to delete file.");
      }
    } catch (err) {
      alert("Error deleting file.");
    }
  };

  // handle the parse of the file and navigate to the parse page
  const handleParse = (file) => {
    navigate("/home", { state: { pdfUrl: file.pdf } }); // Pass file as state
  };


  // fetch the files from the server and display to the home page
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios(`${server}/api/getpdf`);
        setUploads(response.data);
      } catch (err) {
        alert("Error fetching files.");
      }
    };

    fetchData();
  }, []);


  
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-200 px-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md mt-10 p-6">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-4">
          Upload Question Paper
        </h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter the Question Paper Title"
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 mb-3"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleUpload}
          className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Upload PDF
        </button>
        {message && (
          <div className="mt-4 text-center text-sm font-bold text-gray-800">
            {message}
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl mt-10">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Recent Uploads
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-center">
          {uploads.map((file) => (
            <div
              key={file._id}
              className="bg-white p-4 rounded-lg shadow-md text-center relative"
            >
              <MdDeleteForever
                onClick={() => handleDelete(file._id)}
                className="absolute top-2 right-2 text-gray-500 cursor-pointer hover:text-red-600"
              />
              <h3 className="font-bold text-gray-700 mb-2 uppercase">{`Title: ${file.title || "Undefined"}`}</h3>
              <div className="flex justify-between">
                <button
                  className="text-yellow-400 font-semibold hover:text-yellow-500 cursor-pointer"
                  onClick={() => {
                    viewHandler(file.pdf);
                  }}
                >
                  VIEW
                </button>
                <button
                  className="text-green-400 font-semibold hover:text-green-500 cursor-pointer"
                  onClick={() => handleParse(file)}
                >
                  PARSE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
export const server = "http://localhost:8000";
