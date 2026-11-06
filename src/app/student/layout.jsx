"use client";
import React, { useState, useEffect } from "react";
import AiTutorDrawer from "@/components/ai/AiTutorDrawer";
import { useLanguage } from "@/context/LanguageContext";

export default function StudentLayout({ children }) {
  const { isTamil } = useLanguage();
  const [studentName, setStudentName] = useState("மாணவர்");

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data?.profile?.fullName) {
          setStudentName(data.profile.fullName);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {children}
      {/* Global AI Tutor Slide-Over Drawer available across all student routes */}
      <AiTutorDrawer
        studentName={studentName}
        language={isTamil ? "ta" : "en"}
      />
    </>
  );
}

