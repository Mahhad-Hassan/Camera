import React from "react";

export default function CameraView({ videoRef, capturePhoto, stopCamera }) {
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
