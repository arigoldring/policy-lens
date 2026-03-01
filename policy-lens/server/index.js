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
      You are analyzing a Terms of Service or EULA for educational purposes only.

USER PROFILE: ${context || "A standard consumer"}

Your task:
Summarize the document into the structured sections below. Focus only on information explicitly stated in the text. Do not speculate or infer beyond what is written.

Severity Rules:

Mark an item as [CRITICAL] if it includes:
- Broad data collection, data sharing with third parties, or unclear data usage policies.
- The company's right to change terms unilaterally without notice.
- Mandatory arbitration or waiver of class action rights.
- Limitation of liability clauses that significantly restrict user remedies.
- Indemnification requirements imposed on the user.
- Termination without cause or without notice.
- Automatic renewals or binding recurring charges.
- Broad license rights granted to the company over user content.
When an item meets any of the above criteria, prefix the bullet point with:
[CRITICAL]
Structure your response exactly using these section headers:

1. Key User Obligations
2. Company Rights
3. Data Collection & Privacy
4. Arbitration / Class Action Clauses
5. Termination Conditions
6. Risks to the User
7. Personalized Impact for "${context || "standard user"}"

Writing Requirements:
- Use bullet points under each section.
- Use clear 8th-grade reading level.
- Be neutral and factual (not alarmist or overly reassuring).
- Do NOT copy long passages from the agreement.
- You may quote short phrases (5-12 words) if helpful.
- If a section is not mentioned in the text, write: "Not specified."
- Do not repeat the same point across multiple sections.

For the Personalized Impact section:
- Explain how these terms may uniquely affect someone in this role.
- Focus on realistic scenarios, restrictions, or data implications relevant to this user profile.
- Avoid speculation beyond the text.

Accuracy Rules:
- If something is unclear in the agreement, say "Unclear from the document."
- Do not add outside legal knowledge.

End with this exact disclaimer:

"This AI-generated summary is for informational purposes only and does not constitute legal advice. Please review the full agreement and conduct your own research before making decisions."

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