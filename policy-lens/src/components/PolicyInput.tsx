import React, { useRef, useState } from "react";

interface PolicyInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
}

export default function PolicyInput({ text, onTextChange, onAnalyze, onClear }: PolicyInputProps) {
  const [filename, setFilename] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".txt")) {
      alert("Please upload a .txt file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  function handleClear() {
    setFilename(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClear();
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '10px' }}>Upload or Paste Policy</h2>

      <div style={uploadBoxStyle}>
        <label style={fileLabelStyle}>
          📁 Upload .txt file
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
        {filename && <span style={filenameStyle}>📄 {filename}</span>}
      </div>

      <textarea
        className="textarea"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Paste Terms & Conditions here..."
        style={textareaStyle}
      />

      <div style={footerStyle}>
        <small>{text.length.toLocaleString()} characters</small>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleClear} className="secondary-button">
            Clear
          </button>
          <button
            className="primary-button"
            onClick={onAnalyze}
            disabled={text.trim().length === 0}
            style={{ 
              backgroundColor: text.trim().length > 0 ? '#4a90e2' : '#ccc',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: text.trim().length > 0 ? 'pointer' : 'default'
            }}
          >
            Analyze Policy
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle: React.CSSProperties = {
  maxWidth: "800px",
  margin: "0 auto",
  padding: "20px",
  backgroundColor: '#f9f9f9',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
};

const uploadBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '15px'
};

const fileLabelStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px'
};

const filenameStyle: React.CSSProperties = {
  marginLeft: 12,
  fontSize: '14px',
  color: '#666',
  fontStyle: "italic"
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  height: "250px",
  padding: "12px",
  fontSize: "14px",
  lineHeight: '1.5',
  borderRadius: '8px',
  border: '1px solid #ddd',
  boxSizing: 'border-box',
  resize: "vertical",
  fontFamily: 'inherit'
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '10px'
};