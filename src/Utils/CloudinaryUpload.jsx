export default async function uploadToCloudinary({
  preview,
  patientName,
  setUploading,
  setPreview,
  setPatientName,
  setCameraOn,
  setShowOptions,
}) {
  const CLOUD_NAME = "dugrzv8ja";
  const UPLOAD_PRESET = "patient_preset";

  if (!preview || !patientName) {
    alert("Please enter patient name and select/capture a photo.");
    return;
  }

  try {
    setUploading(true);

    let file;
    if (preview.startsWith("data:image")) {
      const blob = await fetch(preview).then((res) => res.blob());
      file = new File([blob], "capture.png", { type: "image/png" });
    } else {
      file = await fetch(preview).then((res) => res.blob());
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "patients");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    console.log("Uploaded:", { name: patientName, url: data.secure_url });
    alert("Upload successful ✅");

    setPatientName("");
    setPreview(null);
    setShowOptions(false);
    setCameraOn(false);
    setUploading(false);
  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload failed ❌");
    setUploading(false);
  }
}
