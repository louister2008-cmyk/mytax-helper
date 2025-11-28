"use client";

import { useEffect, useState } from "react";

export default function AnalysisPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("analysisResult");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {
        setData(null);
      }
    }
  }, []);

  // 防呆：analysisResult 不存在
  if (!data || !data.final) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>No analysis data found.</h2>
        <a href="/upload" style={{ color: "#3b82f6" }}>Upload again</a>
      </div>
    );
  }

  const { clean, final } = data;

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>Receipt Analysis</h1>

      <p style={{ opacity: 0.7 }}>
        AI has extracted & classified this receipt automatically.
      </p>

      {/* Extracted info */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          background: "#ffffff",
        }}
      >
        <h3 style={{ fontWeight: "600", marginBottom: "10px" }}>
          Extracted Information
        </h3>

        <div style={{ lineHeight: "1.8" }}>
          <div><strong>Merchant:</strong> {final.merchant || "Unknown"}</div>
          <div><strong>Date:</strong> {final.date || "Unknown"}</div>
          <div><strong>Amount:</strong> RM {final.amount?.toFixed(2) || "0.00"}</div>
          <div><strong>Category:</strong> {final.category}</div>
          <div><strong>Tax Eligible:</strong> {final.eligible_for_tax ? "Yes" : "No"}</div>
        </div>
      </div>

      <a
        onClick={() => {
          const existing = JSON.parse(localStorage.getItem("receipts") || "[]");
          existing.push(final);
          localStorage.setItem("receipts", JSON.stringify(existing));
          window.location.href = "/summary";
        }}
        style={{
          marginTop: "24px",
          display: "inline-block",
          padding: "12px 20px",
          background: "#2563eb",
          color: "white",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Save & Continue →
      </a>
    </div>
  );
}
