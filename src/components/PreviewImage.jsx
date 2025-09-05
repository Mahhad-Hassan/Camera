import React from "react";

export default function PreviewImage({ preview, uploading, uploadToCloudinary }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold">Preview:</h3>
      <img
        src={preview}
        alt="Preview"
        className="mt-2 w-full h-64 object-cover rounded-lg shadow-md"
      />
      <button
        onClick={uploadToCloudinary}
        disabled={uploading}
        className="mt-3 bg-purple-600 text-white w-full py-2 rounded-lg disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload to Cloudinary"}
      </button>
    </div>
  );
}
