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
        maxOutputTokens: 9000, // Slightly higher to accommodate the extra section
      },
    });

    // 2. Weave the user's context into the prompt
    const prompt = `
      You are analyzing a Terms of Service or EULA for educational purposes only.

USER PROFILE: ${context || "A standard consumer"}

OUTPUT FORMAT RULES (MANDATORY):

- You MUST output ALL 7 section headers exactly as written below, in the exact order.
- You MUST include at least ONE bullet point under EACH section.
- If the text does not mention that topic, output exactly:
  - Not specified. [tags: other]
- Every bullet MUST end with a tag label in this exact format:
  [tags: tag1, tag2]
- Tags must be lowercase and chosen only from the allowed list below.
- If no category clearly applies, use:
  [tags: other]
- If a bullet qualifies as critical, prefix it with:
  [CRITICAL]
- Do NOT omit any section.
- Do NOT add extra headers.
- Do NOT explain the tags.

------------------------------------------------------------

ALLOWED TAGS (use exact spelling, lowercase only):

autoRenewal  
dataCollection  
dataSale  
dataRetention  
tracking  
arbitration  
liability  
unilateralChanges  
userContentLicense  
termination  
indemnification  
other  

------------------------------------------------------------

Your task:
Summarize the document into the structured sections below. Focus ONLY on information explicitly stated in the text. Do not speculate or infer beyond what is written.

------------------------------------------------------------

Severity Rules:

Prefix a bullet with [CRITICAL] ONLY if it includes ANY of the following:

- Automatic renewals, recurring billing, subscription terms that renew unless cancelled, free trials that convert to paid plans, or charges that continue without explicit re-consent.
- Broad data collection practices, behavioral tracking, sale of personal data, sharing with third parties or affiliates, or vague language such as "for business purposes."
- Indefinite or unclear data retention policies.
- Broad, perpetual, worldwide, transferable, sublicensable, or royalty-free license rights granted to the company over user-generated content.
- The company's right to change terms unilaterally without meaningful notice.
- Mandatory arbitration or waiver of class action rights.
- Limitation of liability clauses that significantly restrict user remedies.
- Indemnification requirements imposed on the user.
- Termination without cause or without notice.

Only mark as [CRITICAL] if clearly supported by the text.

------------------------------------------------------------

Structure your response EXACTLY using these section headers:

1. Key User Obligations
2. Company Rights
3. Data Collection & Privacy
4. Arbitration / Class Action Clauses
5. Termination Conditions
6. Risks to the User
7. Personalized Impact for "${context || "standard user"}"

------------------------------------------------------------

Writing Requirements:

- Use bullet points under each section.
- Use clear 8th-grade reading level.
- Be neutral and factual.
- Do NOT copy long passages from the agreement.
- You may quote short phrases (5-12 words) if helpful.
- Do not repeat the same point across multiple sections.
- If unclear, state: "Unclear from the document."

------------------------------------------------------------

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