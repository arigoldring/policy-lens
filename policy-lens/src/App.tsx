import { useState } from "react";
import PolicyInput from "./components/PolicyInput";
import { normalizeText } from "./utilities/normalize";
import { chunkText } from "./utilities/chunks";
import { detectors, detectorLabels } from "./utilities/detect";
import type { DetectorKey, Flag } from "./utilities/detect";
import { testGemini } from "./utilities/ai";
import "./App.css";

function App() {
  // --- Text & Context State ---
  const [currentText, setCurrentText] = useState<string>("");
  const [userContext, setUserContext] = useState<string>(""); // Stores "Student", "Teacher", etc.
  const [lastReceivedText, setLastReceivedText] = useState<string>("");
  
  // --- Analysis State ---
  const [chunks, setChunks] = useState<string[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);
  
  // --- AI Summary State ---
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const allKeys = Object.keys(detectors) as DetectorKey[];
  const [selected, setSelected] = useState<DetectorKey[]>(allKeys);

  async function handleAnalyze() {
    if (!currentText.trim()) return;

    try {
      setError("");
      setSummary("");
      setIsLoading(true);
      setHasAnalyzed(true);

      const normalized = normalizeText(currentText);
      const chunked = chunkText(normalized);

      setLastReceivedText(normalized);
      setChunks(chunked);

      // Local Scan Logic
      const keysToScan = selected.length > 0 ? selected : allKeys;
      const found: Flag[] = keysToScan.flatMap((k) => detectors[k](chunked));
      setFlags(found);
      // Get unique chunk indexes that were flagged
const flaggedIdxs = Array.from(new Set(found.map((f) => f.chunkIndex)));

// Add neighboring chunks for context
const contextIdxs = new Set<number>();
for (const idx of flaggedIdxs) {
  contextIdxs.add(idx);
  if (idx - 1 >= 0) contextIdxs.add(idx - 1);
  if (idx + 1 < chunked.length) contextIdxs.add(idx + 1);
}

// Sort indexes for clean ordering
const orderedIdxs = Array.from(contextIdxs).sort((a, b) => a - b);

// Build text to send to AI
const aiText =
  orderedIdxs.length === 0
    ? normalized // fallback if no flags
    : orderedIdxs
        .map((i) => `Segment ${i + 1}\n${chunked[i]}`)
        .join("\n\n---\n\n");

      // API Call - Now sending 'context' to the backend
      const response = await fetch("http://localhost:3001/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: aiText,
          context: userContext // This is the crucial addition
        }),
      });

      if (!response.ok) throw new Error("Could not connect to the AI server.");

      const data = await response.json();
      setSummary(data.summary || "No summary was returned.");

    } catch (err: unknown) {
      console.error("Analysis Error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setCurrentText("");
    setUserContext(""); // Clear the persona too
    setLastReceivedText("");
    setChunks([]);
    setFlags([]);
    setHasAnalyzed(false);
    setSelected([]);
    setSummary("");
    setError("");
  }

  return (
    <div className="app-wrapper">
      <div className="container">
        <header className="app-header">
          <h1>PolicyLens</h1>
          <p>Personalized Legal Analyst</p>
        </header>

        <main className="content-layout">
          {/* Section 1: Input & Context */}
          <section className="input-section">
            <PolicyInput 
              text={currentText} 
              onTextChange={setCurrentText} 
              context={userContext}
              onContextChange={setUserContext}
              onAnalyze={handleAnalyze}
              onClear={handleClear} 
            />
          </section>

          {/* Section 2: Scan Settings */}
          <section className="section">
            <h2>Scan Settings</h2>
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
          </section>

          {/* Section 3: AI Output (Only shows if there's activity) */}
          {(summary || isLoading || error) && (
            <section className="section summary-section">
              <h2>AI Insight {userContext ? `for ${userContext}` : ""}</h2>
              {isLoading && <div className="loader">Analyzing policy from your perspective...</div>}
              {error && <div className="error-message" style={{ color: '#e11d48', fontWeight: '600' }}>{error}</div>}
              {summary && (
                <div className="summary-box">
                  {summary}
                </div>
              )}
            </section>
          )}

          {/* Section 4: Flagged Results */}
          <section className="section">
            <h2>Detected Clauses ({flags.length})</h2>
            {!hasAnalyzed && <p className="muted text-center">Upload a policy to see specific legal flags.</p>}
            {hasAnalyzed && flags.length === 0 && <p className="text-center">✅ No selected issues detected.</p>}
            
            <div className="flags-container">
              {flags.map((flag, idx) => (
                <div key={idx} className="flag-card">
                  <span className="flag-category">{flag.category}</span>
                  <p className="flag-snippet">"{flag.snippet}"</p>
                  <small>Segment #{flag.chunkIndex + 1}</small>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="debug-info">
          <details>
            <summary>System Health</summary>
            <div className="debug-content">
              <p>Chars: {lastReceivedText.length} | Segments: {chunks.length}</p>
              <button className="secondary-button" onClick={async () => alert(await testGemini("PolicyLens Online"))}>
                Ping AI Server
              </button>
            </div>
          </details>
        </footer>
      </div>
    </div>
  );
}

export default App;