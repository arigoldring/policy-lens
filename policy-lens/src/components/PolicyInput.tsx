// src/components/PolicyInput.tsx
import React, { useRef, useState } from "react";

interface PolicyInputProps {
  text: string;
  onTextChange: (text: string) => void;
}

export default function PolicyInput({ text, onTextChange }: PolicyInputProps) {
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
    reader.onerror = () => {
      alert("Error reading file.");
      setFilename(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onTextChange("");
    };

    reader.readAsText(file);
  }

  return (
    <div className="input-card">
      <h2>Paste Terms & Conditions</h2>

      <div className="file-row">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
        />
        {filename && <span className="filename">Loaded: {filename}</span>}
      </div>

      <textarea
        className="textarea"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Paste Terms & Conditions here..."
      />

      <p>{text.length} characters</p>
    </div>
  );
}