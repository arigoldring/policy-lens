import dotenv from "dotenv";
dotenv.config();
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/summarize", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a legal assistant. Summarize EULAs and Terms of Service clearly and concisely. Highlight risky clauses."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    res.json({ summary: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to summarize" });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});