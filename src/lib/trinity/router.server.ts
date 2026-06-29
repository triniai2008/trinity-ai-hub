// Trinity 1.0 Router + Judge. Server-only.
import { streamText, generateText, type LanguageModel, type ModelMessage } from "ai";
import { createOpenRouterProvider } from "./providers/openrouter.server";
import { createHuggingFaceTextProvider } from "./providers/huggingface.server";
import { createNvidiaProvider } from "./providers/nvidia.server";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { type ModelDef, type ThinkingMode, type Capability, planForMode, detectCapability, getModel } from "./models";

export interface RouteResult {
  plan: ModelDef[];
  capability: Capability;
  mode: ThinkingMode;
}

export function route(userText: string, mode: ThinkingMode, includePremium = false): RouteResult {
  const capability = detectCapability(userText);
  const plan = planForMode(capability, mode, includePremium);
  return { plan, capability, mode };
}

/** Build an AI SDK language model for a given Trinity model id, with provider fallback chain. */
export function buildModel(def: ModelDef): LanguageModel | null {
  if (def.provider === "openrouter") {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) return fallbackLovable(def);
    return createOpenRouterProvider(key)(def.providerId);
  }
  if (def.provider === "huggingface") {
    const key = process.env.HUGGINGFACE_API_KEY ?? process.env.HUGGINGFACE_API_KEY_BACKUP;
    if (!key) return fallbackLovable(def);
    return createHuggingFaceTextProvider(key)(def.providerId);
  }
  if (def.provider === "nvidia") {
    const key = process.env.NVIDIA_API_KEY;
    if (!key) return fallbackLovable(def);
    return createNvidiaProvider(key)(def.providerId);
  }
  if (def.provider === "lovable") {
    return fallbackLovable(def);
  }
  return null;
}

function fallbackLovable(def: ModelDef): LanguageModel | null {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return null;
  // Map Trinity ids to Lovable AI Gateway equivalents where possible.
  const map: Record<string, string> = {
    gpt: "openai/gpt-5-mini",
    claude: "openai/gpt-5",
    gemini: "google/gemini-2.5-pro",
  };
  const fallbackId = map[def.id] ?? "google/gemini-3-flash-preview";
  return createLovableAiGatewayProvider(key)(fallbackId);
}

/** Run one model and return its text. */
export async function runOne(def: ModelDef, messages: ModelMessage[], system?: string): Promise<{ model: ModelDef; text: string; error?: string }> {
  const model = buildModel(def);
  if (!model) return { model: def, text: "", error: "no_provider" };
  try {
    const { text } = await generateText({ model, system, messages });
    return { model: def, text };
  } catch (err) {
    return { model: def, text: "", error: err instanceof Error ? err.message : String(err) };
  }
}

/** Run multiple models in parallel, return only successful responses. */
export async function runParallel(plan: ModelDef[], messages: ModelMessage[], system?: string) {
  const results = await Promise.allSettled(plan.map((d) => runOne(d, messages, system)));
  return results
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((r): r is { model: ModelDef; text: string; error?: string } => !!r && !!r.text);
}

/** Judge agent: scores responses and returns the winner. Uses a fast Gemini model. */
export async function judge(
  question: string,
  candidates: { model: ModelDef; text: string }[],
): Promise<{ winnerIndex: number; scores: number[]; reasoning: string }> {
  if (candidates.length === 0) return { winnerIndex: -1, scores: [], reasoning: "no candidates" };
  if (candidates.length === 1) return { winnerIndex: 0, scores: [100], reasoning: "single candidate" };

  const judgeModel = buildModel(getModel("gemini")!) ?? fallbackLovable({ id: "gemini" } as ModelDef);
  if (!judgeModel) {
    // No judge available — pick highest-priority model deterministically.
    return { winnerIndex: 0, scores: candidates.map(() => 50), reasoning: "no judge model available" };
  }

  const list = candidates
    .map((c, i) => `## Candidate ${i + 1} — ${c.model.label}\n${c.text}`)
    .join("\n\n");

  const prompt = `You are the Trinity Judge Agent. Score each candidate answer to the user's question on a 0-100 scale considering: accuracy, reasoning, creativity, code quality (if applicable), hallucination (penalty), and conciseness.

User question:
"""
${question}
"""

Candidates:
${list}

Respond in STRICT JSON only:
{"scores":[<score1>,<score2>,...],"winner":<1-indexed>,"reasoning":"<one sentence>"}`;

  try {
    const { text } = await generateText({ model: judgeModel, prompt, temperature: 0 });
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no json");
    const parsed = JSON.parse(match[0]) as { scores: number[]; winner: number; reasoning: string };
    const winnerIndex = Math.max(0, Math.min(candidates.length - 1, (parsed.winner ?? 1) - 1));
    return { winnerIndex, scores: parsed.scores ?? [], reasoning: parsed.reasoning ?? "" };
  } catch {
    // Judge failed — pick longest non-empty as fallback heuristic.
    let best = 0;
    let bestLen = 0;
    candidates.forEach((c, i) => {
      if (c.text.length > bestLen) { best = i; bestLen = c.text.length; }
    });
    return { winnerIndex: best, scores: candidates.map((c) => c.text.length), reasoning: "judge fallback (length heuristic)" };
  }
}

/** Stream the chosen winner's content back to the client using the same model. */
export function streamWinner(winner: ModelDef, messages: ModelMessage[], system?: string) {
  const model = buildModel(winner);
  if (!model) throw new Error("no_provider_for_winner");
  return streamText({ model, system, messages });
}
