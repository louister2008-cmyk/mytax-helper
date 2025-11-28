"use client";

import { useEffect, useState } from "react";

const LIMITS = {
  Medical: 8000,
  Lifestyle: 2500,
  Sports: 500,
  Insurance: 3000,
  Parents: 1500,
  SSPN: 8000,
  Others: 0,
};

export default function SummaryPage() {
  const [receipts, setReceipts] = useState([]);
  const [totals, setTotals] = useState({});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("receipts") || "[]");
    setReceipts(data);

    // 初始化分类金额
    const totals = {
      Medical: 0,
      Lifestyle: 0,
      Sports: 0,
      Insurance: 0,
      Parents: 0,
      SSPN: 0,
      Others: 0,
    };

    // 加总分类金额
    data.forEach((r) => {
      const cat = r.category || "Others";
      totals[cat] += r.amount;
    });

    setTotals(totals);
  }, []);

  const totalDeduction = Object.entries(totals).reduce((sum, [cat, amount]) => {
    const limit = LIMITS[cat] || 0;
    return sum + Math.min(amount, limit);
  }, 0);

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        Tax Summary
      </h1>

      <p style={{ opacity: 0.7 }}>
        Here's your total deductible amount based on all analyzed receipts.
      </p>

      {/* 总扣税 */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #ddd",
          background: "#eef6ff",
        }}
      >
        <h2>Total Deduction Eligible</h2>
        <div style={{ fontSize: "32px", fontWeight: "bold", color: "#2563eb" }}>
          RM {totalDeduction.toFixed(2)}
        </div>
      </div>

      {/* 分类列表 */}
      <div style={{ marginTop: "30px" }}>
        {Object.entries(totals).map(([cat, amount]) => {
          const limit = LIMITS[cat];
          return (
            <div
              key={cat}
              style={{
                marginBottom: "20px",
                padding: "20px",
                border: "1px solid #eee",
                borderRadius: "12px",
                background: "white",
              }}
            >
              <strong>{cat}</strong>
              <div style={{ marginTop: "5px" }}>
                RM {amount.toFixed(2)} / RM {limit.toFixed(2)}
              </div>

              {/* 进度条 */}
              <div
                style={{
                  marginTop: "10px",
                  height: "10px",
                  background: "#e5e7eb",
                  borderRadius: "5px",
                }}
              >
                <div
                  style={{
                    width: `${Math.min((amount / limit) * 100, 100)}%`,
                    height: "100%",
                    background: "#2563eb",
                    borderRadius: "5px",
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 按钮 */}
      <div style={{ marginTop: "30px", textAlign: "right" }}>
        <a
          href="/upload"
          style={{
            padding: "12px 20px",
            background: "#2563eb",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Upload More Receipts
        </a>
      </div>
    </div>
  );
}
