type PolicyViewerProps = {
  chunks: string[];
  activeIndex: number | null;
  containerRef?: React.RefObject<HTMLDivElement | null>;
};

export function PolicyViewer({ 
  chunks, 
  activeIndex, 
  containerRef 
}: PolicyViewerProps) {
  return (
    <div
      ref={containerRef}   // ✅ THIS WAS MISSING
      className="w-full max-h-[520px] overflow-y-auto rounded-2xl border border-slate-200 bg-white/70 p-4"
    >
      {chunks.map((chunk, i) => (
        <div
          key={i}
          id={`seg-${i}`}
          className={[
            "rounded-xl p-4 mb-3 border",
            activeIndex === i
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-200 bg-white",
          ].join(" ")}
        >
          <div className="text-xs font-semibold text-slate-500 mb-2">
            Segment {i + 1}
          </div>
          <pre className="whitespace-pre-wrap break-words text-slate-800 font-sans">
            {chunk}
          </pre>
        </div>
      ))}
    </div>
  );
}