import React, { useState, useRef, useEffect } from "react";
import PatientInput from "./PatientInput";
import CameraView from "./CameraView";
import PreviewImage from "./PreviewImage";

import UploadOptions from "./Uploadoptions";
import uploadToCloudinary from "../Utils/CloudinaryUpload";

export default function PatientForm() {
  const [patientName, setPatientName] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [preview, setPreview] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [uploading, setUploading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // 📌 File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setShowOptions(false);
    }
  };

  // 📌 Camera Functions
  const startCamera = async (mode = facingMode) => {
    try {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });
      setStream(mediaStream);
      setCameraOn(true);
      setShowOptions(false);
      setFacingMode(mode);
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
  }, [stream]);

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
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setCameraOn(false);
  };

  const switchCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    startCamera(newMode);
  };

  const handleUpload = () =>
    uploadToCloudinary({
      preview,
      patientName,
      setUploading,
      setPreview,
      setPatientName,
      setCameraOn,
      setShowOptions,
    });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-0">
      <div className="bg-white shadow-lg rounded-none lg:rounded-2xl p-6 w-full h-screen lg:max-w-md lg:h-auto">
        <h2 className="text-2xl font-bold mb-4">Patient Form</h2>

        <PatientInput value={patientName} onChange={setPatientName} />

        <UploadOptions
          setShowOptions={setShowOptions}
          showOptions={showOptions}
          fileInputRef={fileInputRef}
          startCamera={startCamera}
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        {cameraOn && (
          <CameraView
            videoRef={videoRef}
            capturePhoto={capturePhoto}
            switchCamera={switchCamera}
            stopCamera={stopCamera}
          />
        )}

        {preview && (
          <PreviewImage
            preview={preview}
            uploading={uploading}
            uploadToCloudinary={handleUpload}
          />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
