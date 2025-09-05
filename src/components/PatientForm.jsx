import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import PatientInput from "./PatientInput";
import CameraView from "./CameraView";
import PreviewImage from "./PreviewImage";
import UploadOptions from "./Uploadoptions";
import uploadToCloudinary from "../Utils/CloudinaryUpload";
import MedicineName from "./MedicineName";
import MedicineQuantity from "./MedicineQuantity";
import MedicineSchedule from "./MedicineSchedule";

export default function PatientForm() {
  const [patientName, setPatientName] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [medicineQuantity, setMedicineQuantity] = useState("");
  const [medicineSchedule, setMedicineSchedule] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [preview, setPreview] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [stream, setStream] = useState(null);
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
      processImage(url); // OCR from file
    }
  };

  // 📌 Camera Functions
  const startCamera = async () => {
    try {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // always back camera
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
    processImage(img); // OCR after capture
  };

  const stopCamera = () => {
    const streamObj = videoRef.current?.srcObject;
    if (streamObj) streamObj.getTracks().forEach((t) => t.stop());
    setCameraOn(false);
  };

  const switchCamera = () => {
    // Optional: For scanning, we usually keep back camera
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

  // 📌 OCR using Tesseract
  const processImage = async (imageDataUrl) => {
    try {
      const { data } = await Tesseract.recognize(imageDataUrl, "eng", {
        logger: (m) => console.log(m),
      });
      const lines = data.text.split("\n").map((l) => l.trim()).filter(Boolean);

      // Example simple mapping (adjust based on your paper format)
      setPatientName(lines[0] || "");
      setMedicineName(lines[1] || "");
      setMedicineQuantity(lines[2] || "");
      setMedicineSchedule(lines[3] || "");
    } catch (err) {
      console.error("OCR error:", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-0">
      <div className="bg-white shadow-lg rounded-none lg:rounded-2xl p-6 w-full h-screen lg:max-w-md lg:h-auto">
        <h2 className="text-2xl font-bold mb-4">Patient Form</h2>

        <PatientInput value={patientName} onChange={setPatientName} />
        <MedicineName value={medicineName} onChange={setMedicineName} />
        <MedicineQuantity value={medicineQuantity} onChange={setMedicineQuantity} />
        <MedicineSchedule value={medicineSchedule} onChange={setMedicineSchedule} />

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
