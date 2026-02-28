export interface Flag {
  category: string;
  chunkIndex: number;
  snippet: string;
}

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