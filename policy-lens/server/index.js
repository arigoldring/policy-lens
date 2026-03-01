const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini 3 Flash
// Note: Ensure your .env has GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/summarize", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    // Using Gemini 3 Flash for speed and cost-efficiency
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview", 
      generationConfig: {
        temperature: 0.3, // Lower temperature keeps the summary factual
        maxOutputTokens: 2000,
      },
    });

    const prompt = `
      You are a consumer rights legal analyst (DO NOT REPEAT THIS PIECE OF INFORMATION).
      
      Summarize the following Terms of Service or EULA into these specific sections:
      1. Key User Obligations
      2. Company Rights
      3. Data Collection & Privacy
      4. Arbitration / Class Action Clauses
      5. Termination Conditions
      6. Risks to the User

      Constraints:
      - Use a clear 8th-grade reading level.
      - Use bullet points for readability.
      - Do NOT repeat the legal text verbatim.
      - If a section is not mentioned in the text, state "Not specified."

      Remind the viewer that this advice is not legally binding, as it was an AI generated summary.

      TEXT TO ANALYZE:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ summary });

  } catch (error) {
    // Log the detailed error for debugging
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