import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// 1. Initialize the API with your Key
// For a hackathon/local testing, you can paste the string here, 
// but eventually, use an .env file!


// 2. Specify the model (Gemini 1.5 Flash is fastest/cheapest)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function testGemini(prompt: string) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to Gemini.";
  }
}