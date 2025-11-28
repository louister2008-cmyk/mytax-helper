"use client";

import { useEffect, useState } from "react";

export default function AnalysisPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const result = window.localStorage.getItem("analysisResult");
    if (result) {
      setData(JSON.parse(result));
    }
  }, []);

  if (!data) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>No analysis data found.</h2>
        <p>Please upload a receipt first.</p>
        <a href="/upload" style={{ color: "#3b82f6" }}>Go to Upload</a>
      </div>
    );
  }

  const { clean, final } = data;

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        Receipt Analysis
      </h1>

      <p style={{ opacity: 0.7 }}>
        AI has extracted and classified this receipt automatically.
      </p>

      {/* 分析结果卡片 */}
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
          <div><strong>Merchant:</strong> {final.merchant}</div>
          <div><strong>Date:</strong> {final.date}</div>
          <div><strong>Amount:</strong> RM {final.amount.toFixed(2)}</div>
          <div><strong>Category (AI):</strong> {final.category}</div>
          <div><strong>Sub-category:</strong> {final.sub_category}</div>
          <div><strong>Eligible for Tax:</strong> {final.eligible_for_tax ? "✔ Yes" : "❌ No"}</div>
          <div><strong>Tax Category:</strong> {final.tax_category}</div>
          <div><strong>Month:</strong> {final.month}</div>
          <div><strong>Confidence:</strong> {(final.confidence * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* OCR Cleaned Text */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          background: "#fafafa",
        }}
      >
        <h3 style={{ fontWeight: "600", marginBottom: "10px" }}>
          Cleaned OCR Text
        </h3>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontSize: "14px",
            opacity: 0.8,
          }}
        >
{clean.clean_text}
        </pre>
      </div>

      {/* Next Step 按钮 */}
      <a
        onClick={() => {
          const existing = JSON.parse(localStorage.getItem("receipts") || "[]");
          existing.push(final);
          localStorage.setItem("receipts", JSON.stringify(existing));
          window.location.href = "/summary";
        }}
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          background: "#2563eb",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          display: "inline-block",
          cursor: "pointer",
        }}
      >
        Save & Continue →
      </a>
    </div>
  );
}
