import { useEffect, useRef, useState } from "react";

export default function UseCamera(videoRef, canvasRef, setPreview, setCameraOn) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // default back camera
  const [zoomLevel, setZoomLevel] = useState(1);
  const initialDistanceRef = useRef(null);

  // 📸 Start camera
  const startCamera = async (mode = facingMode) => {
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });
      setStream(mediaStream);
      setCameraOn(true);
      setFacingMode(mode);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  // 🎥 Attach stream to <video>
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = async () => {
        await videoRef.current.play();
      };
    }
  }, [stream]);

  // 🔎 Handle pinch-to-zoom
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTouchStart = (e) => {
      if (facingMode !== "environment") return;
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = async (e) => {
      if (facingMode !== "environment") return;
      if (e.touches.length === 2 && initialDistanceRef.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);

        let newZoom = zoomLevel * (newDistance / initialDistanceRef.current);
        newZoom = Math.min(Math.max(newZoom, 1), 5);

        setZoomLevel(newZoom);
        initialDistanceRef.current = newDistance;

        const track = stream?.getVideoTracks()[0];
        if (track && track.getCapabilities().zoom) {
          try {
            await track.applyConstraints({ advanced: [{ zoom: newZoom }] });
          } catch (err) {
            console.warn("Zoom not supported:", err);
          }
        } else {
          video.style.transform = `scale(${newZoom})`;
        }
      }
    };

    const handleTouchEnd = () => {
      initialDistanceRef.current = null;
    };

    video.addEventListener("touchstart", handleTouchStart, { passive: false });
    video.addEventListener("touchmove", handleTouchMove, { passive: false });
    video.addEventListener("touchend", handleTouchEnd);

    return () => {
      video.removeEventListener("touchstart", handleTouchStart);
      video.removeEventListener("touchmove", handleTouchMove);
      video.removeEventListener("touchend", handleTouchEnd);
    };
  }, [zoomLevel, stream, facingMode]);

  // 📷 Capture photo
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

  // 🛑 Stop camera
  const stopCamera = () => {
    const currentStream = videoRef.current?.srcObject;
    if (currentStream) {
      currentStream.getTracks().forEach((t) => t.stop());
    }
    setCameraOn(false);
    setStream(null);
  };

  // 🔄 Switch front/back camera
  const switchCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    startCamera(newMode);
  };

  return {
    startCamera,
    capturePhoto,
    switchCamera,
    stopCamera,
  };
}
