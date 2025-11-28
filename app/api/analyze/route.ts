import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 商家规则映射（B版）
const RULES: Record<string, string> = {
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
  "GREAT EASTERN": "Insurance",
};

// ---- API Handler ----
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    
    // ---- STEP 1: OCR ----
    const ocr = await (client.images as any).extractText({
      file: buffer,
      purpose: "ocr",
    });

    const text = ocr.text || "";

    // ---- STEP 2: 提取干净信息 ----
    const clean = {
      merchant:
        text.match(/(?<=MERCHANT:|STORE:|SHOP:).*/i)?.[0]?.trim() || "",
      date: text.match(/\d{4}[-/]\d{2}[-/]\d{2}/)?.[0] || "",
      amount: parseFloat(text.match(/(\d+\.\d+)/)?.[0] || "0"),
      clean_text: text,
    };

    // ---- STEP 3: 分类 ----
    const merchantUpper = clean.merchant.toUpperCase();
    const mapped = RULES[merchantUpper] || "Others";

    const final = {
      ...clean,
      category: mapped,
      sub_category: mapped,
      eligible_for_tax: mapped !== "Others",
      tax_category: mapped,
      month: clean.date.slice(0, 7),
      confidence: 0.92,
    };

    return NextResponse.json(
      { success: true, clean, final },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, stack: String(err) },
      { status: 500 }
    );
  }
}
