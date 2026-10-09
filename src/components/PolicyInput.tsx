import React, { useRef, useState } from "react";
import { DISCORD_TOS } from "./discord";
import DiscordLogo from "../assets/Discord-Symbol-White.png";
import { META_TOS } from "./meta";
import Facebook_Logo from "../assets/Facebook_Logo_Primary.png";
import { AMAZON_TOS } from "./amazon";
import Amazon_Logo_1 from "../assets/Amazon_Logo_1.png";

interface PolicyInputProps {
  text: string;
  onTextChange: (text: string) => void;
  context: string;
  onContextChange: (context: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function PolicyInput({
  text,
  onTextChange,
  context,
  onContextChange,
  onAnalyze,
  onClear,
  textareaRef,
}: PolicyInputProps) {
  const [filename, setFilename] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".txt")) {
      alert("Please upload a .txt file.");
      return;
    }

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => onTextChange(((e.target?.result as string) ?? ""));
    reader.readAsText(file);
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-white/30 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]">
      <h2 className="text-[0.9rem] uppercase tracking-[0.1em] text-slate-500 mb-5 border-b border-slate-200 pb-2.5">
        Step 1: Context & Policy
      </h2>

      {/* Context */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
          Who are you? (e.g., student, office worker, developer)
        </label>
        <input
          type="text"
          value={context}
          onChange={(e) => onContextChange(e.target.value)}
          placeholder="I am a student at a public university..."
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
        />
      </div>

      {/* Upload */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
  <label className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 cursor-pointer text-sm font-semibold hover:border-indigo-500 transition">
    📁 Upload .txt
    <input
      ref={fileInputRef}
      type="file"
      accept=".txt"
      onChange={handleFileUpload}
      className="hidden"
    />
  </label>

  <button
  type="button"
  className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm font-semibold hover:border-indigo-500 transition flex items-center gap-2"
  onClick={() => {
    setFilename("Discord Terms (preset)");
    onTextChange(DISCORD_TOS);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }}
>
  <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
  <img
    src={DiscordLogo}
    alt="Discord"
    className="w-3 h-3"
  />
</div>
  Load Discord Terms
</button>
<button
  type="button"
  className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm font-semibold hover:border-indigo-500 transition flex items-center gap-2"
  onClick={() => {
    setFilename("Meta Terms (preset)");
    onTextChange(META_TOS);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }}
>
  <img
    src={Facebook_Logo}
    alt="Meta"
    className="w-4 h-4 object-contain"
  />
  Load Meta Terms
</button>
<button
  type="button"
  className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm font-semibold hover:border-indigo-500 transition flex items-center gap-2"
  onClick={() => {
    setFilename("Amazon Terms (preset)");
    onTextChange(AMAZON_TOS);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }}
>
  <div className="w-6 h-6 bg-slate-200 rounded-md flex items-center justify-center">
  <img
    src={Amazon_Logo_1}
    alt="Amazon"
    className="w-4 h-4 object-contain"
  />
</div>
  Load Amazon
</button>

  {filename && (
    <span className="text-xs italic text-slate-500 ml-auto">📄 {filename}</span>
  )}
</div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Paste Terms & Conditions or EULA here..."
        className="w-full min-h-[360px] p-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 outline-none resize-y focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 mb-4"
      />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClear}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 transition"
        >
          Clear
        </button>

        <button
          onClick={onAnalyze}
          disabled={text.trim().length === 0}
          className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analyze Policy
        </button>
      </div>
    </div>
  );
}