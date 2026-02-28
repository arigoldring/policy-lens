export interface Flag {
  category: string;
  chunkIndex: number;
  snippet: string;
}

/* ---------------- Arbitration ---------------- */

export function detectArbitration(chunks: string[]): Flag[] {
  const flags: Flag[] = [];

  chunks.forEach((chunk, i) => {
    const lower = chunk.toLowerCase();

    if (
      lower.includes("binding arbitration") ||
      lower.includes("arbitration") ||
      lower.includes("class action waiver")
    ) {
      flags.push({
        category: "Arbitration / Lawsuit Waiver",
        chunkIndex: i,
        snippet: chunk.slice(0, 200),
      });
    }
  });

  return flags;
}

/* ---------------- Data Sharing ---------------- */

export function detectDataSharing(chunks: string[]): Flag[] {
  const flags: Flag[] = [];

  chunks.forEach((chunk, i) => {
    const lower = chunk.toLowerCase();

    if (
      lower.includes("personal information") ||
      lower.includes("third parties") ||
      lower.includes("affiliates") ||
      lower.includes("business partners") ||
      lower.includes("sell your data") ||
      lower.includes("share your data") ||
      lower.includes("advertising") ||
      lower.includes("analytics")
    ) {
      flags.push({
        category: "Data Sharing / Personal Information",
        chunkIndex: i,
        snippet: chunk.slice(0, 200),
      });
    }
  });

  return flags;
}
export function detectAll(chunks: string[]): Flag[] {
  return [
    ...detectArbitration(chunks),
    ...detectDataSharing(chunks),
  ];
}