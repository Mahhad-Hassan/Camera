import React, { useEffect, useRef, useState } from "react";

export default function CameraView({ videoRef, capturePhoto, stopCamera, stream }) {
  const initialDistanceRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    const handleTouchMove = async (e) => {
      if (e.touches.length === 2 && initialDistanceRef.current) {
        e.preventDefault();

        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);

        let newZoom = zoomLevel * (newDistance / initialDistanceRef.current);
        newZoom = Math.min(Math.max(newZoom, 1), 5);

        setZoomLevel(newZoom);
        initialDistanceRef.current = newDistance;

        if (track && capabilities.zoom) {
          try {
            await track.applyConstraints({
              advanced: [{ zoom: newZoom }],
            });
          } catch (err) {
            console.warn("Zoom not supported:", err);
          }
        } else if (videoRef.current) {
          videoRef.current.style.transform = `scale(${newZoom})`;
        }
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const videoEl = videoRef.current;
    videoEl.addEventListener("touchstart", handleTouchStart, { passive: false });
    videoEl.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      videoEl.removeEventListener("touchstart", handleTouchStart);
      videoEl.removeEventListener("touchmove", handleTouchMove);
    };
  }, [stream, videoRef, zoomLevel]);

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-lg shadow-md w-full h-[50vh] lg:h-96 bg-black object-cover"
        style={{ touchAction: "none" }}
      />

      <div className="flex gap-4">
        <button
          onClick={capturePhoto}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Scan Paper
        </button>
        <button
          onClick={stopCamera}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
