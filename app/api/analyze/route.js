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

// ----- API ROUTE -----
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // -----------------------------
    // ① Step: OCR（GPT-4o Vision）
    // -----------------------------
    const ocr = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Extract all text from this receipt image. Return in JSON." },
            { type: "image", image: buffer }
          ]
        }
      ]
    });

    const ocrText = ocr.choices[0].message.content;

    // -----------------------------
    // ② Step: Clean-up
    // -----------------------------
    const cleanRes = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
你是一个收据清理系统。根据以下 OCR 输出，提取 clean_text、merchant、date、amount。

OCR:
${ocrText}

输出格式：
{
  "clean_text": "...",
  "merchant": "...",
  "date": "YYYY-MM-DD",
  "amount": number
}
`
        }
      ]
    });

    const cleanData = JSON.parse(cleanRes.choices[0].message.content);

    // -----------------------------
    // ③ Step: Rule-based Category
    // -----------------------------
    const merchantUpper = cleanData.merchant?.toUpperCase() || "";
    const ruleCategory = RULES[merchantUpper] || null;

    // -----------------------------
    // ④ Step: Final Classification
    // -----------------------------
    const classifyRes = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
你是 MyTax Helper 的分类系统。

clean_data:
${JSON.stringify(cleanData)}

rule_category: ${ruleCategory}

判断分类（Medical / Lifestyle / Sports / Insurance / Parents / SSPN / Others）

输出必须为 JSON：
{
  "merchant": "...",
  "date": "YYYY-MM-DD",
  "amount": 0.00,
  "category": "...",
  "sub_category": "...",
  "eligible_for_tax": true/false,
  "tax_category": "...",
  "month": "...",
  "confidence": 0.90
}
`
        }
      ]
    });

    const finalData = JSON.parse(classifyRes.choices[0].message.content);

    return NextResponse.json({
      success: true,
      ocr: ocrText,
      clean: cleanData,
      final: finalData
    });

  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
