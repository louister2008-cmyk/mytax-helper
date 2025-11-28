"use client";

export const dynamic = "force-dynamic"; // ⬅️ 关键修复：禁止 prerender

import { useState } from "react";

export default function UploadPage() {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    window.localStorage.setItem("analysisResult", JSON.stringify(data));
    window.location.href = "/analysis";
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        Upload Receipt
      </h1>

      <p style={{ opacity: 0.7 }}>
        Upload your receipt and let AI analyze it automatically.
      </p>

      <label
        style={{
          display: "block",
          marginTop: "20px",
          padding: "40px",
          border: "2px dashed #cfd4dd",
          borderRadius: "12px",
          textAlign: "center",
          cursor: "pointer",
          background: "#fafafa",
        }}
      >
        <div>📄 Click to Upload</div>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleUpload}
        />
      </label>

      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{
            marginTop: "20px",
            width: "100%",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        />
      )}

      {loading && (
        <p style={{ marginTop: "20px", fontSize: "18px" }}>
          ⏳ Analyzing…
        </p>
      )}
    </div>
  );
}
