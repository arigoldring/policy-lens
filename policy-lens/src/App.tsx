import { useState } from "react";
import PolicyInput from "./components/PolicyInput";
import { normalizeText } from "./utilities/normalize";
import { chunkText } from "./utilities/chunks";
import { detectors, detectorLabels } from "./utilities/detect";
import type { DetectorKey, Flag } from "./utilities/detect";
import { testGemini } from "./utilities/ai";
import "./App.css";

function App() {
  const [currentText, setCurrentText] = useState<string>("");
  const [lastReceivedText, setLastReceivedText] = useState<string>("");
  const [chunks, setChunks] = useState<string[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const allKeys = Object.keys(detectors) as DetectorKey[];
  const [selected, setSelected] = useState<DetectorKey[]>([]);

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
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setCurrentText("");
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
          <p>Consumer Rights Legal Analyst</p>
        </header>

        <main className="content-layout">
          <section className="input-section">
            <PolicyInput 
              text={currentText} 
              onTextChange={setCurrentText} 
              onAnalyze={handleAnalyze}
              onClear={handleClear} 
            />
          </section>

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

          {(summary || isLoading || error) && (
            <section className="section summary-section">
              <h2>AI Insight</h2>
              {isLoading && <div className="loader">Analyzing fine print...</div>}
              {error && <div className="error-message">{error}</div>}
              {summary && <div className="summary-box">{summary}</div>}
            </section>
          )}

          <section className="section">
            <h2>Detected Clauses ({flags.length})</h2>
            {!hasAnalyzed && <p className="muted text-center">Ready to analyze your policy text.</p>}
            <div className="flags-container">
              {flags.map((flag, idx) => (
                <div key={idx} className="flag-card">
                  <span className="flag-category">{flag.category}</span>
                  <p className="flag-snippet">{flag.snippet}</p>
                  <small>Segment #{flag.chunkIndex + 1}</small>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="debug-info">
          <details>
            <summary>System Diagnostics</summary>
            <div className="debug-content">
              <p>Chars: {lastReceivedText.length} | Segments: {chunks.length}</p>
              <button className="secondary-button" onClick={async () => alert(await testGemini("Online"))}>
                Test Server
              </button>
            </div>
          </details>
        </footer>
      </div>
    </div>
  );
}

export default App;