import React from "react";

export default function PatientInput({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Enter patient name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-2 rounded-md mb-4 w-full"
    />
  );
}
