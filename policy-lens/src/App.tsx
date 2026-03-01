import { useState } from "react";
import PolicyInput from "./components/PolicyInput";
import { normalizeText } from "./utilities/normalize";
import { chunkText } from "./utilities/chunks";
import { detectors, detectorLabels } from "./utilities/detect";
import type { DetectorKey, Flag } from "./utilities/detect";
import { testGemini } from "./utilities/ai";
import "./App.css";

function App() {
  // --- Analysis State ---
  const [lastReceivedText, setLastReceivedText] = useState<string>("");
  const [chunks, setChunks] = useState<string[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);
  
  // --- AI Summary State ---
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // --- Selection State ---
  const allKeys = Object.keys(detectors) as DetectorKey[];
  const [selected, setSelected] = useState<DetectorKey[]>([]);

  // --- Logic ---
  async function handleAnalyze(rawText: string) {
    if (!rawText.trim()) return;

    try {
      setError("");
      setSummary("");
      setIsLoading(true);
      setHasAnalyzed(true);

      const normalized = normalizeText(rawText);
      const chunked = chunkText(normalized);

      setLastReceivedText(normalized);
      setChunks(chunked);

      const keysToScan = selected.length > 0 ? selected : [];
      const found: Flag[] = keysToScan.flatMap((k) => detectors[k](chunked));
      setFlags(found);

      const response = await fetch("http://localhost:3001/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: normalized }),
      });

      if (!response.ok) throw new Error("Could not connect to the AI server.");

      const data = await response.json();
      setSummary(data.summary || "No summary was returned.");

    } catch (err: unknown) {
      // FIX: Replace 'any' with a type guard
      console.error("Analysis Error:", err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during analysis.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setLastReceivedText("");
    setChunks([]);
    setFlags([]);
    setHasAnalyzed(false);
    setSelected([]);
    setSummary("");
    setError("");
  }

  return (
    <div className="container">
      <header className="app-header">
        <h1>PolicyLens</h1>
        <p>Consumer Rights Legal Analyst (Gemini 3 Power)</p>
      </header>

      <PolicyInput 
        onAnalyze={handleAnalyze} 
        onClear={handleClear} 
      />

      <div className="section">
        <h2>Refine Local Scan</h2>
        <div className="detector-grid">
          {allKeys.map((key) => (
            <label key={key} className="checkbox-item">
              <input
                type="checkbox"
                checked={selected.includes(key)}
                onChange={(e) => {
                  setSelected((prev) =>
                    e.target.checked ? [...prev, key] : prev.filter((k) => k !== key)
                  );
                }}
              />{" "}
              {detectorLabels[key]}
            </label>
          ))}
        </div>
      </div>

      <div className="section summary-section">
        <h2>Plain-English Summary</h2>
        {isLoading && <div className="loader">Gemini is translating legalese...</div>}
        {error && <div className="error-message" style={{ color: 'red', fontWeight: 'bold' }}>{error}</div>}
        {summary && (
          <div className="summary-box" style={{ whiteSpace: 'pre-wrap' }}>
            {summary}
          </div>
        )}
      </div>

      <div className="section">
        <h2>Detected Clauses ({flags.length})</h2>
        {!hasAnalyzed && <p className="muted">Upload a policy to see specific legal flags.</p>}
        {hasAnalyzed && flags.length === 0 && <p>✅ No selected issues detected in the text.</p>}
        
        <div className="flags-container">
          {flags.map((flag, idx) => (
            <div key={idx} className="flag-card">
              <span className="flag-category">{flag.category}</span>
              <p className="flag-snippet">"{flag.snippet}"</p>
              <small>Found in segment #{flag.chunkIndex + 1}</small>
            </div>
          ))}
        </div>
      </div>

      <details className="debug-info">
        <summary>System Health</summary>
        <div className="debug-content">
          <p>Text Length: {lastReceivedText.length} characters</p>
          <p>Segments: {chunks.length}</p>
          <button onClick={async () => alert(await testGemini("PolicyLens is online!"))}>
            Ping AI Server
          </button>
        </div>
      </details>
    </div>
  );
}

export default App;