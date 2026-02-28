// src/App.tsx
import { useState } from "react";
import PolicyInput from "./components/PolicyInput";
import { normalizeText } from "./utilities/normalize";
import { chunkText } from "./utilities/chunks";
import "./App.css";
import { detectors, detectorLabels } from "./utilities/detect";
import type { DetectorKey, Flag } from "./utilities/detect";

function App() {
  const [currentText, setCurrentText] = useState<string>("");

  const [lastReceivedText, setLastReceivedText] = useState<string>("");
  const [chunks, setChunks] = useState<string[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);

  const allKeys = Object.keys(detectors) as DetectorKey[];
  const [selected, setSelected] = useState<DetectorKey[]>([]);

  function runAnalysis(rawText: string, keys: DetectorKey[]) {
    const normalized = normalizeText(rawText);
    const chunked = chunkText(normalized);

    setHasAnalyzed(true);
    setLastReceivedText(normalized);
    setChunks(chunked);

    const found: Flag[] = keys.flatMap((k) => detectors[k](chunked));
    setFlags(found);
  }

  function handleAnalyzeSelected() {
    runAnalysis(currentText, selected);
  }

  function handleAnalyzeAll() {
    setSelected(allKeys);
    runAnalysis(currentText, allKeys);
  }

  function handleClear() {
    setCurrentText("");
    setLastReceivedText("");
    setChunks([]);
    setFlags([]);
    setHasAnalyzed(false);
    setSelected([]);
  }

  return (
    <div className="container">
      <h1>PolicyLens</h1>

      {/* Controlled input */}
      <PolicyInput text={currentText} onTextChange={setCurrentText} />

      {/* Detector selection + actions */}
      <div className="section">
        <h2>Choose what to scan for</h2>

        <div>
          {allKeys.map((key) => (
            <label key={key} style={{ display: "block", marginBottom: "6px" }}>
              <input
                type="checkbox"
                checked={selected.includes(key)}
                onChange={(e) => {
                  setSelected((prev) =>
                    e.target.checked
                      ? [...prev, key]
                      : prev.filter((k) => k !== key),
                  );
                }}
              />{" "}
              {detectorLabels[key]}
            </label>
          ))}
        </div>

        <div style={{ marginTop: "10px" }}>
          <button
            onClick={handleAnalyzeSelected}
            disabled={currentText.trim().length === 0 || selected.length === 0}
          >
            Analyze Selected
          </button>

          <button
            onClick={handleAnalyzeAll}
            style={{ marginLeft: "10px" }}
            disabled={currentText.trim().length === 0}
          >
            Analyze All
          </button>

          <button onClick={handleClear} style={{ marginLeft: "10px" }}>
            Clear
          </button>
        </div>
      </div>

      {/* Read check */}
      <div className="section">
        <h2>Read Check</h2>

        <p className="status">
          Status:{" "}
          {lastReceivedText.trim().length > 0
            ? "✅ Text received"
            : "❌ No text yet"}
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

      {/* Chunk check */}
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

      {/* Detection check */}
      <div className="section">
        <h2>Detection Check</h2>
        <p>Flags found: {flags.length}</p>

        {hasAnalyzed && flags.length === 0 && (
          <p>✅ No selected issues detected with the current rules.</p>
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