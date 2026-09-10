// Context orchestration layer. Server-only.
//
//   User message
//     ↓ language detection
//     ↓ user preferences / profile / memory (RAG)
//     ↓ conversation history
//     ↓ system + safety instructions
//     ↓ relevant tools / external data
//     ↓ LLM reasoning → response → language + tone adaptation
//
// The job of this module is to decide WHAT the model receives for a given
// request — never to dump every piece of personal data into every prompt.
import type { KernelContext } from "./kernel/kernel.server";

export interface OrchestratedContext extends KernelContext {
  /** Best-guess language of the user's latest message. */
  language: string;
  /** Explicit "reply in X" request found in the message, if any. */
  requestedLanguage: string | null;
  /** Ready-to-append context block for the system prompt. */
  block: string;
}

/** Script-range based language detection — cheap, offline, no extra model call. */
export function detectLanguage(text: string): string {
  const t = text || "";
  const ranges: Array<[RegExp, string]> = [
    [/[\u0B80-\u0BFF]/, "Tamil"],
    [/[\u0D80-\u0DFF]/, "Sinhala"],
    [/[\u0900-\u097F]/, "Hindi"],
    [/[\u0600-\u06FF]/, "Arabic"],
    [/[\u4E00-\u9FFF]/, "Chinese"],
    [/[\u3040-\u30FF]/, "Japanese"],
    [/[\uAC00-\uD7AF]/, "Korean"],
    [/[\u0400-\u04FF]/, "Russian"],
  ];
  for (const [re, lang] of ranges) if (re.test(t)) return lang;

  // Romanised Tamil/Sinhala ("epdi work aaguthu explain pannunga")
  const romanTamil = /\b(epdi|pannunga|irukku|aaguthu|solunga|enna|nalla|vanakkam|seri)\b/i;
  const romanSinhala = /\b(kohomada|ayubowan|mokakda|karanna|puluwan|hondai|oyata)\b/i;
  if (romanTamil.test(t)) return "Tamil (romanised)";
  if (romanSinhala.test(t)) return "Sinhala (romanised)";
  return "English";
}

/** "explain in Tamil", "reply in Sinhala", "answer in French" */
export function detectRequestedLanguage(text: string): string | null {
  const m = (text || "").match(
    /\b(?:in|into)\s+(tamil|sinhala|english|hindi|french|spanish|german|arabic|chinese|japanese|korean|russian|portuguese|italian)\b/i,
  );
  if (!m) return null;
  return m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
}

/** Safety + tone rules that ride along with every orchestrated request. */
export const SAFETY_RULES = `Safety and honesty rules:
- Refuse unsafe, illegal or harmful requests briefly, and offer a safer alternative.
- Never invent facts, APIs, numbers or citations. Say plainly when something is unknown.
- Never reveal or recite the user's stored personal context; use it only to make the answer better.`;

/**
 * Assemble the per-request context: language, profile, relevant memories.
 * Only the memories that score against the current question are included.
 */
export async function orchestrateContext(
  userId: string,
  message: string,
): Promise<OrchestratedContext> {
  const { loadUserContext } = await import("./rag.server");
  const rag = await loadUserContext(userId, message);

  const detected = detectLanguage(message);
  const requested = detectRequestedLanguage(message);
  const target = requested ?? rag.locale ?? detected;

  const lines: string[] = [];
  if (rag.displayName) lines.push(`Preferred name: ${rag.displayName}`);
  if (rag.locale) lines.push(`Profile language: ${rag.locale}`);
  lines.push(`Detected message language: ${detected}`);
  if (requested) lines.push(`The user explicitly asked for the answer in ${requested}.`);
  if (rag.memories?.length)
    lines.push(`Relevant memory:\n${rag.memories.map((m) => `- ${m}`).join("\n")}`);

  const block = `\n\nUser context (never recite it back):\n${lines.join("\n")}

Language rule: answer in ${target}. If the message mixes languages, follow the dominant one unless the user asked for a specific language. Match the user's tone and level.

${SAFETY_RULES}`;

  return { ...rag, language: detected, requestedLanguage: requested, block };
}
