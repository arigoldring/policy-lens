import { useRef, useState } from "react";
import PolicyInput from "./components/PolicyInput";
import { normalizeText } from "./utilities/normalize";
import { chunkText } from "./utilities/chunks";
import { detectors, detectorLabels } from "./utilities/detect";
import type { DetectorKey, Flag } from "./utilities/detect";
import { testGemini } from "./utilities/ai";

function buildOffsetsFromSearch(fullText: string, chunked: string[]) {
  const offsets: { start: number; end: number }[] = [];
  let cursor = 0;

  for (const chunk of chunked) {
    // Trim only for searching (keeps offsets stable in fullText)
    const needle = chunk.trim();
    if (!needle) {
      offsets.push({ start: cursor, end: cursor });
      continue;
    }

    const idx = fullText.indexOf(needle, cursor);

    if (idx === -1) {
      // fallback: try searching from the beginning (rare)
      const idx2 = fullText.indexOf(needle);
      if (idx2 === -1) {
        offsets.push({ start: cursor, end: cursor });
        continue;
      }
      offsets.push({ start: idx2, end: idx2 + needle.length });
      cursor = idx2 + needle.length;
      continue;
    }

    offsets.push({ start: idx, end: idx + needle.length });
    cursor = idx + needle.length;
  }

  return offsets;
}
function App() {
  const [currentText, setCurrentText] = useState("");
  const [userContext, setUserContext] = useState("");
  const [lastReceivedText, setLastReceivedText] = useState("");
  
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [chunks, setChunks] = useState<string[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [criticalPrefs, setCriticalPrefs] = useState<string[]>([]);

  const allKeys = Object.keys(detectors) as DetectorKey[];
  const [selected, setSelected] = useState<DetectorKey[]>(allKeys);

  
  const [chunkOffsets, setChunkOffsets] = useState<{start:number; end:number}[]>([]);
  const criticalOptions = [
  
  { key: "autoRenewal", label: "Auto-renewals / subscriptions" },
  { key: "dataCollection", label: "Data collection" },
  { key: "dataSale", label: "Sale / sharing of data" },
  { key: "tracking", label: "Tracking / cookies" },
  { key: "dataRetention", label: "Data retention / deletion" },
  { key: "userContent", label: "License to your content" },
  { key: "arbitration", label: "Arbitration / class action waiver" },
  { key: "liability", label: "Liability waivers" },
  { key: "unilateralChanges", label: "Company can change terms" },
  { key: "termination", label: "Termination / bans" },
  { key: "indemnification", label: "Indemnification" },
];

  async function handleAnalyze() {
    if (!currentText.trim()) return;

    try {
      setError("");
      setSummary("");
      setIsLoading(true);
      setHasAnalyzed(true);

      const chunked = chunkText(currentText);

setChunkOffsets(buildOffsetsFromSearch(currentText, chunked));
setLastReceivedText(currentText);
      

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
          ? currentText
          : orderedIdxs.map((i) => `Segment ${i + 1}\n${chunked[i]}`).join("\n\n---\n\n");

      const response = await fetch("http://localhost:3001/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText, context: userContext }),
      });

      if (!response.ok) throw new Error("Could not connect to the AI server.");

      const data = await response.json();
      console.log("SUMMARY LENGTH:", (data.summary ?? "").length);
      console.log("SUMMARY END:", (data.summary ?? "").slice(-200));
      setSummary(data.summary || "No summary was returned.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }
  function getCaretPixelTop(textarea: HTMLTextAreaElement, pos: number): number {
  const style = window.getComputedStyle(textarea);

  // Mirror div
  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordWrap = "break-word";
  div.style.overflowWrap = "break-word";

  // Copy the important textarea styles so wrapping matches exactly
  div.style.font = style.font;
  div.style.fontSize = style.fontSize;
  div.style.fontFamily = style.fontFamily;
  div.style.fontWeight = style.fontWeight;
  div.style.letterSpacing = style.letterSpacing;
  div.style.lineHeight = style.lineHeight;
  div.style.padding = style.padding;
  div.style.border = style.border;
  div.style.boxSizing = style.boxSizing;

  // Critical: match textarea width
  div.style.width = `${textarea.clientWidth}px`;

  // Put text up to caret
  const before = textarea.value.slice(0, pos);

  // textarea treats newlines a bit specially; mirror should end with a char
  div.textContent = before;

  // Caret marker
  const span = document.createElement("span");
  span.textContent = "\u200b"; // zero-width space
  div.appendChild(span);

  document.body.appendChild(div);
  const top = span.offsetTop;
  document.body.removeChild(div);

  return top;
}
  
function jumpToTextareaChunk(index: number) {
  const ta = textareaRef.current;
  const r = chunkOffsets[index];
  if (!ta || !r) return;

  ta.scrollIntoView({ behavior: "smooth", block: "center" });

  window.setTimeout(() => {
    ta.focus({ preventScroll: true });
    ta.setSelectionRange(r.start, r.end);

    requestAnimationFrame(() => {
      const caretTop = getCaretPixelTop(ta, r.start);

      // Scroll so caret is a little below the top (nice feel)
      const padding = 24;
      const targetTop = Math.max(0, caretTop - padding);

      ta.scrollTo({ top: targetTop, behavior: "smooth" });

      ta.classList.add("ring-4", "ring-indigo-500/20");
      setTimeout(() => ta.classList.remove("ring-4", "ring-indigo-500/20"), 400);
    });
  }, 250);
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
    setChunkOffsets([]);
    setCriticalPrefs([]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-slate-100 bg-fixed text-slate-900">
      <div className="min-h-screen p-10 flex justify-center">
        <div className="w-full max-w-[1400px] flex flex-col gap-8">
          <header className="text-center">
            <h1 className="text-[3.2rem] font-extrabold text-indigo-500 tracking-[-0.05em] drop-shadow-[0_10px_20px_rgba(99,102,241,0.2)]">
              PolicyLens
            </h1>
            <p className="text-slate-600">Policy Insight Assistant</p>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-stretch">
  {/* LEFT column */}
  <section className="w-full flex flex-col gap-6">
    <PolicyInput
      text={currentText}
      onTextChange={(raw) => {
    const normalized = normalizeText(raw);
    setCurrentText(normalized);
      }}
      context={userContext}
      onContextChange={setUserContext}
      onAnalyze={handleAnalyze}
      onClear={handleClear}
      textareaRef={textareaRef}
    />

    {/* Critical Preferences */}
    <section className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]">
      <h2 className="text-[0.9rem] uppercase tracking-[0.1em] text-slate-500 mb-5 border-b border-slate-200 pb-2.5">
        Step 3: Mark Which Are Most Important To You
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  {criticalOptions.map((option) => (
    <label
      key={option.key}
      className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium transition hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-md"
    >
      <input
        type="checkbox"
        checked={criticalPrefs.includes(option.key)}
        onChange={(e) =>
          setCriticalPrefs((prev) =>
            e.target.checked
              ? [...prev, option.key]
              : prev.filter((k) => k !== option.key)
          )
        }
      />
      {option.label}
    </label>
  ))}
</div>
    </section>
  </section>

  {/* RIGHT column */}
  <div className="flex flex-col gap-8">
    {/* Scan Settings */}
    <section className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]">
      <h2 className="text-[0.9rem] uppercase tracking-[0.1em] text-slate-500 mb-5 border-b border-slate-200 pb-2.5">
        Step 2: Scan Settings
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
                  e.target.checked
                    ? [...prev, key]
                    : prev.filter((k) => k !== key)
                )
              }
            />
            {detectorLabels[key]}
          </label>
        ))}
      </div>
    </section>

    {/* Detected Clauses */}
    <section className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]">
      <h2 className="text-[0.9rem] uppercase tracking-[0.1em] text-slate-500 mb-5 border-b border-slate-200 pb-2.5">
        Detected Clauses ({flags.length})
      </h2>

      {!hasAnalyzed && (
        <p className="text-slate-500 text-center">
          Upload a policy to see specific flags.
        </p>
      )}

      {hasAnalyzed && flags.length === 0 && (
        <p className="text-center">✅ No selected issues detected.</p>
      )}

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {flags.map((flag, idx) => (
          <div
            key={idx}
            onClick={() => jumpToTextareaChunk(flag.chunkIndex)}
            className="cursor-pointer p-5 bg-white border border-rose-100 rounded-2xl shadow-sm hover:border-indigo-500 hover:shadow-md transition"
          >
            <span className="inline-block text-rose-700 font-bold text-xs bg-rose-50 px-3 py-1 rounded-full uppercase mb-3">
              {flag.category}
            </span>
            <p className="italic text-slate-600 border-l-4 border-slate-200 pl-4">
              "{flag.snippet}"
            </p>
            <small className="text-slate-500">
              Segment #{flag.chunkIndex + 1}
            </small>
          </div>
        ))}
      </div>
    </section>
  </div>

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
  <div className="whitespace-pre-wrap break-words leading-8 bg-slate-50/60 p-6 rounded-xl border-l-8 border-indigo-500
                  max-h-[70vh] overflow-y-auto overflow-x-hidden pr-2">
    {summary.split("\n").map((rawLine, i) => {
      const line = rawLine.trimEnd();

      // Extract tags
      const tagMatch = line.match(/\[tags:\s*([^\]]+)\]/i);
      const tags = tagMatch ? tagMatch[1].split(",").map((t) => t.trim()) : [];

      // Does this line match what user cares about?
      const isRed = tags.some((t) => criticalPrefs.includes(t));

      // Remove metadata from what we DISPLAY
      const cleanLine = line
  .replace(/^\s*-\s*\[CRITICAL\]\s*/i, "- ")
  .replace(/^\s*\[CRITICAL\]\s*/i, "")
  .replace(/\s*\[tags:.*$/i, "")
  .trim();

      // If it's an empty line, keep spacing
      if (!cleanLine) return <div key={i} className="h-2" />;

      return (
        <div
          key={i}
          className={[
            "whitespace-pre-wrap break-words", // ✅ wrapping on child
            isRed ? "text-red-600 font-semibold" : "text-slate-700",
          ].join(" ")}
        >
          {cleanLine}
        </div>
      );
    })}
  </div>
)}
      
    </section>
  )}
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