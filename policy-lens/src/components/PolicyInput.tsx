import React, { useRef, useState } from "react";

interface PolicyInputProps {
  text: string;
  onTextChange: (text: string) => void;
  context: string;
  onContextChange: (context: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
}

export default function PolicyInput({ 
  text, 
  onTextChange, 
  context, 
  onContextChange, 
  onAnalyze, 
  onClear 
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
    reader.onload = (e) => {
      const fileText = (e.target?.result as string) ?? "";
      onTextChange(fileText);
    };
    reader.readAsText(file);
  }

  return (
    <div className="section">
      <h2 style={{ marginBottom: '15px' }}>Step 1: Context & Policy</h2>
      
      {/* NEW: Context Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
          WHO ARE YOU? (E.G., STUDENT, OFFICE WORKER, DEVELOPER)
        </label>
        <input 
          type="text"
          value={context}
          onChange={(e) => onContextChange(e.target.value)}
          placeholder="I am a student at a public university..."
          style={contextInputStyle}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <label style={fileLabelStyle}>
          📁 Upload .txt
          <input ref={fileInputRef} type="file" accept=".txt" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
        {filename && <span style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>📄 {filename}</span>}
      </div>

      <textarea
        className="textarea"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Paste Terms & Conditions or EULA here..."
        style={{ marginBottom: '15px',color: "black" }}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={onClear} className="secondary-button">Clear</button>
        <button 
          className="primary-button" 
          onClick={onAnalyze} 
          disabled={text.trim().length === 0}
        >
          Analyze Policy
        </button>
      </div>
    </div>
  );
}

const contextInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  fontSize: "0.95rem",
  fontFamily: "Inter, -apple-system, sans-serif",
  boxSizing: "border-box",
  background: "rgba(248, 250, 252, 0.7)",
  outline: "none",
  color: '#0f172a',
};

const fileLabelStyle: React.CSSProperties = {
  padding: '6px 12px',
  backgroundColor: '#f1f5f9',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 600
};