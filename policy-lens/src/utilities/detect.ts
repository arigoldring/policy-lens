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
/* ---------------- Data Retention & Deletion ---------------- */

export function detectDataRetention(chunks: string[]): Flag[] {
  const flags: Flag[] = [];

  chunks.forEach((chunk, i) => {
    const lower = chunk.toLowerCase();

    if (
      lower.includes("retain") ||
      lower.includes("retention") ||
      lower.includes("indefinitely") ||
      lower.includes("as long as necessary") ||
      lower.includes("data deletion") ||
      lower.includes("delete your data") ||
      lower.includes("request deletion") ||
      lower.includes("legal obligation")
    ) {
      flags.push({
        category: "Data Retention / Deletion Policy",
        chunkIndex: i,
        snippet: chunk.slice(0, 200),
      });
    }
  });

  return flags;
}

export function detectUnilateralChanges(chunks: string[]): Flag[] {
  const flags: Flag[] = [];

  chunks.forEach((chunk, i) => {
    const lower = chunk.toLowerCase();

    if (
      lower.includes("we may update these terms") ||
      lower.includes("we may modify these terms") ||
      lower.includes("at our discretion") ||
      lower.includes("without notice") ||
      lower.includes("effective immediately") ||
      lower.includes("we reserve the right to change") ||
      lower.includes("may revise these terms")
    ) {
      flags.push({
        category: "Unilateral Changes (Terms Can Change Anytime)",
        chunkIndex: i,
        snippet: chunk.slice(0, 200),
      });
    }
  });

  return flags;
}

/* ---------------- Liability Waivers ---------------- */

export function detectLiabilityWaiver(chunks: string[]): Flag[] {
  const flags: Flag[] = [];

  chunks.forEach((chunk, i) => {
    const lower = chunk.toLowerCase();

    if (
      lower.includes("limitation of liability") ||
      lower.includes("not liable") ||
      lower.includes("no warranties") ||
      lower.includes("as is") ||
      lower.includes("disclaimer of warranties") ||
      lower.includes("indirect, incidental") ||
      lower.includes("consequential damages")
    ) {
      flags.push({
        category: "Liability Waiver / Disclaimer",
        chunkIndex: i,
        snippet: chunk.slice(0, 200),
      });
    }
  });

  return flags;
}
/* ---------------- Tracking & Cookies ---------------- */

export function detectTracking(chunks: string[]): Flag[] {
  const flags: Flag[] = [];

  chunks.forEach((chunk, i) => {
    const lower = chunk.toLowerCase();

    if (
      lower.includes("cookies") ||
      lower.includes("tracking technologies") ||
      lower.includes("targeted advertising") ||
      lower.includes("interest-based") ||
      lower.includes("behavioral advertising") ||
      lower.includes("pixels") ||
      lower.includes("device identifiers") ||
      lower.includes("analytics providers")
    ) {
      flags.push({
        category: "Tracking / Cookies / Advertising",
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
    ...detectDataRetention(chunks),
    ...detectUnilateralChanges(chunks),
    ...detectTracking(chunks),
    ...detectLiabilityWaiver(chunks)
  ];
}