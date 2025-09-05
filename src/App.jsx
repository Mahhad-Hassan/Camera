import React from "react";
import { Routes, Route } from "react-router-dom";
import PatientForm from "./components/PatientForm";

export default function App() {
  return (
    <Routes>
      {/* default / pe bhi form dikhayega */}
      <Route path="/" element={<PatientForm />} />

      {/* /patient-form pe bhi wahi form dikhayega */}
      <Route path="/patient-form" element={<PatientForm />} />
    </Routes>
  );
}
