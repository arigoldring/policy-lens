import { useState } from "react";
import PolicyInput from "./components/PolicyInput";
import { normalizeText } from "./utilities/normalize";
import { chunkText } from "./utilities/chucks";
import "./App.css";

function App() {
  const [lastReceivedText, setLastReceivedText] = useState<string>("");
  const [chunks, setChunks] = useState<string[]>([]);

  function handleAnalyze(text: string) {
    const normalized = normalizeText(text);
    const chunked = chunkText(normalized);

    setLastReceivedText(normalized);
    setChunks(chunked);
  }

  return (
    <div className="container">
      <h1>PolicyLens</h1>

      <PolicyInput onAnalyze={handleAnalyze} />

      <div className="section">
        <h2>Read Check</h2>

        <p className="status">
          Status:{" "}
          {lastReceivedText.trim().length > 0 ? "✅ Text received" : "❌ No text yet"}
        </p>

        <p>Length: {lastReceivedText.length} characters</p>

        {lastReceivedText.trim().length > 0 && (
          <>
            <h3>Preview (first 500 chars)</h3>
            <pre className="preview-box">
              {lastReceivedText.slice(0, 500)}
              {lastReceivedText.length > 500 ? "..." : ""}
            </pre>
          </>
        )}
      </div>

      <div className="section">
        <h2>Chunk Check</h2>
        <p>Chunks found: {chunks.length}</p>

        {chunks.slice(0, 3).map((chunk, index) => (
          <div key={index} className="section">
            <h3>Chunk #{index + 1}</h3>
            <pre className="preview-box">{chunk}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;