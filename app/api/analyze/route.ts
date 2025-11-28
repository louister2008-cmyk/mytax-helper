import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ----- 商家规则映射（B版规则） -----
const RULES = {
  "POPULAR": "Lifestyle",
  "MPH": "Lifestyle",
  "KINOKUNIYA": "Lifestyle",
  "GUARDIAN": "Medical",
  "WATSONS": "Medical",
  "CARING": "Medical",
  "DECATHLON": "Sports",
  "NIKE": "Sports",
  "ADIDAS": "Sports",
  "PRUDENTIAL": "Insurance",
  "AIA": "Insurance",
  "GREAT EASTERN": "Insurance"
};

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // ---- OCR ----
    const ocr = await client.images.extractText({
      file: buffer,
      purpose: "ocr"
    });

    const text = ocr.text || "";

    // ---- 清洗 ----
    const merchant = text.match(/merchant[: ]*(.*)$/im)?.[1]?.trim() || "";
    const date = text.match(/\d{4}[-\/]\d{2}[-\/]\d{2}/)?.[0] || "";
    const amount = parseFloat(text.match(/\d+\.\d{2}/)?.[0] || "0");

    const clean = {
      merchant,
      date,
      amount,
      clean_text: text
    };

    // ---- 分类 ----
    const mapped = RULES[merchant.toUpperCase()] || "Others";

    const final = {
      merchant,
      date,
      amount,
      category: mapped,
      sub_category: mapped,
      eligible_for_tax: mapped !== "Others",
      tax_category: mapped,
      month: date.slice(0, 7),
      confidence: 0.9
    };

    return NextResponse.json(
      { success: true, clean, final },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
