import { useState } from "react";

interface PolicyInputProps {
  onAnalyze: (text: string) => void;
}

export default function PolicyInput({ onAnalyze }: PolicyInputProps) {
  const [text, setText] = useState<string>("");

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".txt")) {
  alert("Please upload a .txt file.");
  return;
}

    const reader = new FileReader();

    reader.onload = (e) => {
      const fileText = e.target?.result as string;
      setText(fileText);
    };

    reader.readAsText(file);
  }

  function handleClear() {
    setText("");
  }

  return (
    <div style={containerStyle}>
      <h2>Paste Terms & Conditions</h2>

      {/* File Upload */}
      <input type="file" accept=".txt" onChange={handleFileUpload} />

      {/* Text Area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste Terms & Conditions here..."
        style={textareaStyle}
      />

      {/* Character Count */}
      <p>{text.length} characters</p>

      {/* Buttons */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => onAnalyze(text)} disabled={text.trim().length === 0}>Analyze Policy</button>

        <button onClick={handleClear} style={{ marginLeft: "10px" }}>
          Clear
        </button>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  maxWidth: "800px",
  margin: "0 auto",
  padding: "20px",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  height: "250px",
  marginTop: "10px",
  padding: "10px",
  fontSize: "14px",
  resize: "vertical",
};