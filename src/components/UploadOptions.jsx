import React from "react";

export default function UploadOptions({ setShowOptions, showOptions, fileInputRef, startCamera }) {
  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="bg-blue-600 text-white w-full py-2 rounded-lg"
      >
        Upload Files
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
            onClick={() => startCamera("environment")}
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Capture from Camera
          </button>
        </div>
      )}
    </div>
  );
}
