export async function testGemini(prompt: string) {
  try {
    const response = await fetch("http://localhost:3001/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: prompt }), // Sending prompt as 'text' to match your backend
    });

    if (!response.ok) throw new Error("Server connection failed");

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error("Connection Error:", error);
    return "Error connecting to PolicyLens Server.";
  }
}