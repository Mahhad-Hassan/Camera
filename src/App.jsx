import React, { useEffect, useRef, useState } from "react";

export default function PatientForm() {
  const [patientName, setPatientName] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [preview, setPreview] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setShowOptions(false);
    }
  };

 

const startCamera = async (facingMode='user') => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: false,
    });
    setStream(mediaStream);
    setCameraOn(true);
    setShowOptions(false);
  } catch (err) {
    console.error("Camera error:", err);
  }
};


useEffect(() => {
  if (videoRef.current && stream) {
    videoRef.current.srcObject = stream;
    videoRef.current.onloadedmetadata = async () => {
      await videoRef.current.play();
    };
  }
}, [stream])



   const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = canvas.toDataURL("image/png");
    setPreview(img);
    stopCamera();
  };


  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setCameraOn(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Patient Form</h2>

     
        <input
          type="text"
          placeholder="Enter patient name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="border p-2 rounded-md mb-4 w-full"
        />

        
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="bg-blue-600 text-white w-full py-2 rounded-lg"
          >
            Upload
          </button>

         
          {showOptions && (
            <div className="absolute bg-white border rounded-lg shadow-md mt-2 w-full z-10">
              <label className="block px-4 py-2 cursor-pointer hover:bg-gray-100">
                Upload from Gallery
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <button
                onClick={() => startCamera("user")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Capture from Front Camera
              </button>
              <button
                onClick={() => startCamera("environment")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 md:hidden"
              >
                Capture from Back Camera
              </button>
            </div>
          )}
        </div>

        
        {cameraOn && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="rounded-lg shadow-md w-full h-64 bg-black object-cover"
            />
            <div className="flex gap-4">
              <button
                onClick={capturePhoto}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Capture
              </button>
              <button
                onClick={stopCamera}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

       
        {preview && (
          <div className="mt-4">
            <h3 className="font-semibold">Preview:</h3>
            <img
              src={preview}
              alt="Preview"
              className="mt-2 w-full h-64 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

       
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
