export function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")      // Windows newlines → \n
    .replace(/[ \t]+/g, " ")     // collapse spaces/tabs
    .replace(/\n{3,}/g, "\n\n")  // collapse huge blank gaps
    .trim();
}