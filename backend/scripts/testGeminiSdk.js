import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

async function verifyGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not defined in backend/.env");
    process.exit(1);
  }

  console.log(`Connecting to Google GenAI with model: ${model}...`);
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: "Respond with the single word: Connected",
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 20,
      },
    });

    const reply = response.text ? response.text.trim() : "";
    console.log(`✅ Gemini API Status: 200 OK`);
    console.log(`✅ Model Response: ${reply}`);
    console.log("Gemini AI integration is ready for production.");
  } catch (error) {
    console.error("❌ Gemini Connection Error:", error.message);
    process.exit(1);
  }
}

verifyGemini();
