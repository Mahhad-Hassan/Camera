import React, { useEffect, useRef, useState } from "react";

export default function PatientForm() {
  const [patientName, setPatientName] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [preview, setPreview] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
   const [zoomLevel, setZoomLevel] = useState(1);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const  initialDistanceRef=useRef(null);
  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setShowOptions(false);
    }
  };

  const startCamera = async (mode = "user") => {
  try {
    if (stream) stream.getTracks().forEach((t) => t.stop());

    const constraints = {
      video:
        mode === "environment"
          ? { facingMode: { exact: "environment" } }
          : { facingMode: "user" },
      audio: false,
    };

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    setStream(mediaStream);
    setCameraOn(true);
    setFacingMode(mode);

  } catch (err) {
    console.error("Camera error:", err);
    if (mode === "environment") startCamera("user"); // fallback to front camera
  }
};

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = async () => {
        await videoRef.current.play();
      };
    }
  }, [stream]);

    useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = async (e) => {
      if (e.touches.length === 2 && initialDistanceRef.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);

        let newZoom = zoomLevel * (newDistance / initialDistanceRef.current);
        newZoom = Math.min(Math.max(newZoom, 1), 5); // zoom range: 1x - 5x

        setZoomLevel(newZoom);
        initialDistanceRef.current = newDistance;

        // apply zoom to track (if supported)
        const track = stream?.getVideoTracks()[0];
        if (track && track.getCapabilities().zoom) {
          try {
            await track.applyConstraints({
              advanced: [{ zoom: newZoom }],
            });
          } catch (err) {
            console.warn("Zoom not supported:", err);
          }
        } else {
          // fallback: CSS scale (agar hardware zoom supported na ho)
          video.style.transform = `scale(${newZoom})`;
        }
      }
    };

    const handleTouchEnd = () => {
      if (initialDistanceRef.current) {
        initialDistanceRef.current = null;
      }
    };

    video.addEventListener("touchstart", handleTouchStart);
    video.addEventListener("touchmove", handleTouchMove);
    video.addEventListener("touchend", handleTouchEnd);

    return () => {
      video.removeEventListener("touchstart", handleTouchStart);
      video.removeEventListener("touchmove", handleTouchMove);
      video.removeEventListener("touchend", handleTouchEnd);
    };
  }, [zoomLevel, stream]);

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

  const switchCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    startCamera(newMode);
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
            Upload File
          </button>

          {showOptions && (
            <div className="absolute bg-white border rounded-lg shadow-lg mt-2 w-full z-10">
              <button
                onClick={() => fileInputRef.current.click()}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Upload from Media
              </button>
              <button
                onClick={() => startCamera("user")}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Capture from Camera
              </button>
            </div>
          )}
        </div>

       
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

     
        {cameraOn && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <video
              ref={videoRef}
              autoPlay
              playsInline
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
                onClick={switchCamera}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg md:hidden"
              >
                Switch Camera
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
