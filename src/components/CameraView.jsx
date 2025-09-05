import React, { useEffect } from "react";

export default function CameraView({ videoRef, capturePhoto, stopCamera, stream }) {
  useEffect(() => {
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    let lastDist = null;

    const handleTouch = (e) => {
      if (e.touches.length === 2 && capabilities.zoom) {
        e.preventDefault(); // prevent dragging
        const dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );

        if (lastDist) {
          let zoom = track.getSettings().zoom || capabilities.zoom.min;
          const factor = dist / lastDist;
          zoom = Math.min(capabilities.zoom.max, Math.max(capabilities.zoom.min, zoom * factor));
          track.applyConstraints({ advanced: [{ zoom }] });
        }

        lastDist = dist;
      } else {
        lastDist = null;
      }
    };

    const videoEl = videoRef.current;
    videoEl.addEventListener("touchmove", handleTouch, { passive: false });

    return () => {
      videoEl.removeEventListener("touchmove", handleTouch);
    };
  }, [stream, videoRef]);

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-lg shadow-md w-full h-[50vh] lg:h-96 bg-black object-cover"
        style={{ touchAction: "none" }} // disables dragging
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
