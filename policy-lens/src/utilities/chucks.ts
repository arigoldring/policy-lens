export function chunkText(text: string): string[] {
  // Split on blank lines (paragraph breaks)
  return text
    .split(/\n\s*\n/)   // one or more blank lines
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}