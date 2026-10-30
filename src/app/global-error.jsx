"use client";

import React, { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("[Global Error Boundary]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ backgroundColor: "#0d0d1a", color: "#f0f0ff", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ maxWidth: 480, padding: 32, borderRadius: 16, backgroundColor: "#1c1c28", border: "1px solid rgba(244,63,94,0.3)", textAlign: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Aknex COE — System Error Caught</h2>
          <p style={{ fontSize: 13, color: "#a8a8d0", marginBottom: 20 }}>
            The application encountered a client exception. Click below to reload fresh portal assets.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ backgroundColor: "#f59e0b", color: "#000", fontWeight: 700, padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer" }}
          >
            Reload Examination Portal
          </button>
        </div>
      </body>
    </html>
  );
}
