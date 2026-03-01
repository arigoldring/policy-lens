export function chunkText(text: string): string[] {
  const cleaned = text.trim();
  if (!cleaned) return [];

  // 1) Prefer paragraph breaks (blank lines)
  let parts = cleaned
    .split(/\n\s*\n+/)
    .map((c) => c.trim())
    .filter(Boolean);

  if (parts.length > 1) return parts;

  // 2) If no blank lines, try splitting on single newlines
  parts = cleaned
    .split(/\n+/)
    .map((c) => c.trim())
    .filter(Boolean);

  if (parts.length > 1) return mergeToMaxLen(parts, 1200);

  // 3) If still one giant line, chunk by length (hard fallback)
  return chunkByLength(cleaned, 1200);
}

function mergeToMaxLen(parts: string[], maxLen: number): string[] {
  const out: string[] = [];
  let buf = "";

  for (const p of parts) {
    if (!buf) {
      buf = p;
      continue;
    }

    if ((buf + "\n" + p).length <= maxLen) {
      buf += "\n" + p;
    } else {
      out.push(buf);
      buf = p;
    }
  }

  if (buf) out.push(buf);
  return out;
}

function chunkByLength(text: string, maxLen: number): string[] {
  const out: string[] = [];
  let i = 0;

  while (i < text.length) {
    let end = Math.min(i + maxLen, text.length);

    // Try to break nicely near end (sentence / punctuation / space)
    const windowStart = Math.max(i, end - 250);
    const slice = text.slice(windowStart, end);

    const cut =
      Math.max(
        slice.lastIndexOf(". "),
        slice.lastIndexOf("! "),
        slice.lastIndexOf("? "),
        slice.lastIndexOf("; "),
        slice.lastIndexOf(", "),
        slice.lastIndexOf(" ")
      ) + 1;

    if (cut > 50) end = windowStart + cut;

    out.push(text.slice(i, end).trim());
    i = end;
  }

  return out.filter(Boolean);
}