const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/summarize", async (req, res) => {
  try {
    // 1. Extract 'context' from the request body alongside 'text'
    const { text, context } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview", // Updated to the stable Flash model identifier
      generationConfig: {
        temperature: 0.3, 
        maxOutputTokens: 2500, // Slightly higher to accommodate the extra section
      },
    });

    // 2. Weave the user's context into the prompt
    const prompt = `
      You are a consumer rights legal analyst (DO NOT LIST THIS WHEN WRITING, ONLY USE THIS AS CONTEXT FOR THE INFORMATION YOU ARE ABOUT TO WRITE)
      
      USER PROFILE: ${context || "A standard consumer"}

      Summarize the following Terms of Service or EULA into these specific sections:
      1. Key User Obligations
      2. Company Rights
      3. Data Collection & Privacy
      4. Arbitration / Class Action Clauses
      5. Termination Conditions
      6. Risks to the User
      7. PERSONALIZED IMPACT: Specifically explain how these terms affect a person who is a "${context || "standard user"}". 
         Focus on use-cases, restrictions, or data risks unique to this role.

      Constraints:
      - Use a clear 8th-grade reading level.
      - Use bullet points for readability.
      - Do NOT repeat the legal text verbatim.
      - If a section is not mentioned in the text, state "Not specified."
      - End with a clear disclaimer: "This is an AI-generated summary and is not legally binding advice."

      TEXT TO ANALYZE:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ summary });

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({ 
      error: "Failed to generate summary",
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});