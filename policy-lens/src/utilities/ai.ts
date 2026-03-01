import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Use a supported model:
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function testGemini(prompt: string) {
  console.log("Checking API Key...", !!import.meta.env.VITE_GEMINI_API_KEY);

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to Gemini.";
  }
}