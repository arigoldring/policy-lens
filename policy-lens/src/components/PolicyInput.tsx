// src/components/PolicyInput.tsx
import React, { useRef, useState } from "react";

interface PolicyInputProps {
  onAnalyze: (text: string) => void;
}

export default function PolicyInput({ onAnalyze }: PolicyInputProps) {
  const [text, setText] = useState<string>("");
  const [filename, setFilename] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic file-type guard
    if (!file.name.toLowerCase().endsWith(".txt")) {
      alert("Please upload a .txt file.");
      // clear the file input so user can try again
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileText = e.target?.result as string;
      setText(fileText ?? "");
    };
    reader.onerror = () => {
      alert("Error reading file.");
      setText("");
      setFilename(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    reader.readAsText(file);
  }

  function handleClear() {
    // Clear textarea state
    setText("");

    // Clear filename state
    setFilename(null);

    // Clear the file input element so same file can be re-uploaded
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      /**
       * Note: setting `value = ""` is the usual way to clear an uncontrolled file input.
       * We don't call setFile or similar because we didn't store the File in state.
       */
    }
  }

  return (
    <div style={containerStyle}>
      <h2>Paste Terms & Conditions</h2>

      {/* File Upload */}
      <div style={{ marginBottom: 8 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
        />
        {filename && (
          <span style={{ marginLeft: 12, fontStyle: "italic" }}>
            Loaded: {filename}
          </span>
        )}
      </div>

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
      <div style={{ marginTop: 10 }}>
        <button
          onClick={() => onAnalyze(text)}
          disabled={text.trim().length === 0}
        >
          Analyze Policy
        </button>

        <button onClick={handleClear} style={{ marginLeft: 10 }}>
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