import { useState } from "react";
import PolicyInput from "./components/PolicyInput";

function App() {
  const [lastReceivedText, setLastReceivedText] = useState<string>("");

  function handleAnalyze(text: string) {
    setLastReceivedText(text);
  }

  return (
    <div>
      <h1>PolicyLens</h1>

      <PolicyInput onAnalyze={handleAnalyze} />

      {/* PROOF IT WORKED */}
      <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px" }}>
        <h2>Read Check</h2>

        <p>
          Status:{" "}
          {lastReceivedText.trim().length > 0 ? "✅ Text received" : "❌ No text yet"}
        </p>

        <p>Length: {lastReceivedText.length} characters</p>

        {lastReceivedText.trim().length > 0 && (
          <>
            <h3>Preview (first 300 chars)</h3>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                border: "1px solid #ccc",
                padding: "10px",
              }}
            >
              {lastReceivedText.slice(0, 300)}
              {lastReceivedText.length > 300 ? "..." : ""}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}

export default App;