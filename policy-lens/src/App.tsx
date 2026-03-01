import { useState } from "react";
import PolicyInput from "./components/PolicyInput";
import { normalizeText } from "./utilities/normalize";
import { chunkText } from "./utilities/chunks";
import { detectors, detectorLabels } from "./utilities/detect";
import type { DetectorKey, Flag } from "./utilities/detect";
import { testGemini } from "./utilities/ai";

function App() {
  const [currentText, setCurrentText] = useState("");
  const [userContext, setUserContext] = useState("");
  const [lastReceivedText, setLastReceivedText] = useState("");

  const [chunks, setChunks] = useState<string[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

      const keysToScan = selected.length > 0 ? selected : allKeys;
      const found: Flag[] = keysToScan.flatMap((k) => detectors[k](chunked));
      setFlags(found);

      const flaggedIdxs = Array.from(new Set(found.map((f) => f.chunkIndex)));
      const contextIdxs = new Set<number>();
      for (const idx of flaggedIdxs) {
        contextIdxs.add(idx);
        if (idx - 1 >= 0) contextIdxs.add(idx - 1);
        if (idx + 1 < chunked.length) contextIdxs.add(idx + 1);
      }
      const orderedIdxs = Array.from(contextIdxs).sort((a, b) => a - b);

      const aiText =
        orderedIdxs.length === 0
          ? normalized
          : orderedIdxs.map((i) => `Segment ${i + 1}\n${chunked[i]}`).join("\n\n---\n\n");

      const response = await fetch("http://localhost:3001/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText, context: userContext }),
      });

      if (!response.ok) throw new Error("Could not connect to the AI server.");

      const data = await response.json();
      setSummary(data.summary || "No summary was returned.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setCurrentText("");
    setUserContext("");
    setLastReceivedText("");
    setChunks([]);
    setFlags([]);
    setHasAnalyzed(false);
    setSelected(allKeys);
    setSummary("");
    setError("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-slate-100 bg-fixed text-slate-900">
      <div className="min-h-screen p-10 flex justify-center">
        <div className="w-full max-w-[1400px] flex flex-col gap-8">
          <header className="text-center">
            <h1 className="text-[3.2rem] font-extrabold text-indigo-500 tracking-[-0.05em] drop-shadow-[0_10px_20px_rgba(99,102,241,0.2)]">
              PolicyLens
            </h1>
            <p className="text-slate-600">Personalized Legal Analyst</p>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
            {/* Input */}
            <section className="w-full">
              <PolicyInput
                text={currentText}
                onTextChange={setCurrentText}
                context={userContext}
                onContextChange={setUserContext}
                onAnalyze={handleAnalyze}
                onClear={handleClear}
              />
            </section>

            {/* Scan Settings */}
            <section className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]">
              <h2 className="text-[0.9rem] uppercase tracking-[0.1em] text-slate-500 mb-5 border-b border-slate-200 pb-2.5">
                Scan Settings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allKeys.map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium transition hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(key)}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked ? [...prev, key] : prev.filter((k) => k !== key)
                        )
                      }
                    />
                    {detectorLabels[key]}
                  </label>
                ))}
              </div>
            </section>

            {/* AI Insight full width */}
            {hasAnalyzed && (
  <section className="lg:col-span-2 bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]">
    <h2 className="text-[0.9rem] uppercase tracking-[0.1em] text-slate-500 mb-5 border-b border-slate-200 pb-2.5">
      AI Insight {userContext ? `for ${userContext}` : ""}
    </h2>

    {isLoading && (
      <div className="text-center font-semibold text-indigo-500 py-5 animate-pulse">
        Analyzing policy from your perspective...
      </div>
    )}

    {error && <div className="text-rose-600 font-semibold">{error}</div>}

    {summary && (
      <div className="whitespace-pre-wrap break-words text-slate-700 leading-8 bg-slate-50/60 p-6 rounded-xl border-l-8 border-indigo-500">
        {summary}
      </div>
    )}
  </section>
)}

            {/* Flags full width */}
            <section className="lg:col-span-2 bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]">
              <h2 className="text-[0.9rem] uppercase tracking-[0.1em] text-slate-500 mb-5 border-b border-slate-200 pb-2.5">
                Detected Clauses ({flags.length})
              </h2>

              {!hasAnalyzed && (
                <p className="text-slate-500 text-center">Upload a policy to see specific legal flags.</p>
              )}
              {hasAnalyzed && flags.length === 0 && (
                <p className="text-center">✅ No selected issues detected.</p>
              )}

              <div className="space-y-4">
                {flags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-white border border-rose-100 rounded-2xl shadow-sm"
                  >
                    <span className="inline-block text-rose-700 font-bold text-xs bg-rose-50 px-3 py-1 rounded-full uppercase mb-3">
                      {flag.category}
                    </span>
                    <p className="italic text-slate-600 border-l-4 border-slate-200 pl-4">
                      "{flag.snippet}"
                    </p>
                    <small className="text-slate-500">Segment #{flag.chunkIndex + 1}</small>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <footer className="text-sm text-slate-600">
            <details>
              <summary className="cursor-pointer select-none">System Health</summary>
              <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
                <p>Chars: {lastReceivedText.length} | Segments: {chunks.length}</p>
                <button
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 transition"
                  onClick={async () => alert(await testGemini("PolicyLens Online"))}
                >
                  Ping AI Server
                </button>
              </div>
            </details>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;