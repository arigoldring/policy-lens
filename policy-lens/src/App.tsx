import { useState } from "react";
import PolicyInput from "./components/PolicyInput";
import { normalizeText } from "./utilities/normalize";
import { chunkText } from "./utilities/chucks";
import "./App.css";
import { detectAll} from "./utilities/detect";
import type { Flag } from "./utilities/detect";

function App() {
  const [lastReceivedText, setLastReceivedText] = useState<string>("");
  const [chunks, setChunks] = useState<string[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  function handleAnalyze(text: string) {
  const normalized = normalizeText(text);
  const chunked = chunkText(normalized);
  setHasAnalyzed(true);

  setLastReceivedText(normalized);
  setChunks(chunked);

  const found = detectAll(chunked);
  setFlags(found);
}
function handleClear() {
  setLastReceivedText("");
  setChunks([]);
  setFlags([]);
  setHasAnalyzed(false);
}
  return (
    <div className="container">
      <h1>PolicyLens</h1>

      <PolicyInput onAnalyze={handleAnalyze} onClear={handleClear} />

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
      <div className="section">
  <h2>Detection Check</h2>
  <p>Flags found: {flags.length}</p>

  {hasAnalyzed && flags.length === 0 && (
  <p>✅ No arbitration-related clauses detected...</p>
)}

  {flags.map((flag, idx) => (
    <div key={idx} className="section">
      <strong>{flag.category}</strong>
      <div>Found in chunk #{flag.chunkIndex + 1}</div>
      <pre className="preview-box">{flag.snippet}</pre>
    </div>
  ))}
</div>
</div>
    
  );
}

export default App;