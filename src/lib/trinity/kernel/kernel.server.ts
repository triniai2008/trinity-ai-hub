// Agent Kernel workflow. Server-only.
//
//   prompt → prompt compiled to AI language → Agent Kernel (A3 plan)
//          → harness agent (A1, behind the scenes)
//          → Hermes agent (A2, behind the scenes)
//          → RAG personalization → streamed response
//
// Only the Agent Kernel is named publicly; A1/A2 stay internal.
import {
  createUIMessageStream,
  generateText,
  streamText,
  type LanguageModel,
  type ModelMessage,
  type UIMessage,
} from "ai";
import { buildModel } from "../router.server";
import { getModel, type ThinkingMode } from "../models";
import { COMPILER, KERNEL, HARNESS, HERMES, IDENTITY, personalization } from "./prompts.server";

export type KernelStage =
  | "compile"
  | "kernel"
  | "harness"
  | "hermes"
  | "personalize"
  | "stream";

export interface KernelContext {
  displayName?: string | null;
  memories?: string[];
  locale?: string | null;
}

export interface KernelOptions {
  uiMessages: UIMessage[];
  modelMessages: ModelMessage[];
  question: string;
  mode: ThinkingMode;
  context?: KernelContext;
  /** Fallback model used when no DeepSeek provider key is configured. */
  fallback: LanguageModel;
}

/**
 * Model preference: DeepSeek first (NVIDIA NIM, then Hugging Face, then OpenRouter).
 * buildModel() already degrades to the Lovable gateway when a provider key is absent.
 */
const DEEPSEEK_REASONING = ["nvidia-deepseek-r1", "hf-deepseek-v3", "deepseek-v3"];
const DEEPSEEK_FAST = ["hf-deepseek-v3", "deepseek-v3", "nvidia-deepseek-r1"];
const DEEPSEEK_CODE = ["deepseek-coder", "nvidia-deepseek-r1", "hf-deepseek-v3"];

function pick(ids: string[], fallback: LanguageModel): { model: LanguageModel; label: string } {
  for (const id of ids) {
    const def = getModel(id);
    if (!def) continue;
    const built = buildModel(def);
    if (built) return { model: built, label: def.label };
  }
  return { model: fallback, label: "Kernel fallback" };
}

interface Spec {
  intent?: string;
  task_type?: string;
  constraints?: string[];
  deliverable?: string;
  instruction?: string;
}

interface Plan {
  steps?: string[];
  risks?: string[];
  needs_code?: boolean;
  style?: string;
}

function parseJson<T>(text: string): T | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

export function runAgentKernel(opts: KernelOptions) {
  const { uiMessages, modelMessages, question, mode, fallback } = opts;

  return createUIMessageStream({
    originalMessages: uiMessages,
    execute: async ({ writer }) => {
      const emit = (
        stage: KernelStage,
        status: "start" | "done" | "skip",
        detail?: string,
      ) =>
        writer.write({
          type: "data-kernel-step",
          data: { stage, status, detail: detail ?? "" },
          transient: true,
        });

      const fast = pick(DEEPSEEK_FAST, fallback);
      const brain = pick(DEEPSEEK_REASONING, fallback);

      // ── 1. Prompt → AI language ────────────────────────────────
      emit("compile", "start");
      let spec: Spec | null = null;
      try {
        const { text } = await generateText({
          model: fast.model,
          system: COMPILER,
          prompt: question,
          temperature: 0,
        });
        spec = parseJson<Spec>(text);
        emit("compile", "done", spec?.task_type ?? "compiled");
      } catch {
        emit("compile", "skip", "compiler unavailable");
      }

      const specBlock = spec
        ? `Compiled task spec:\n${JSON.stringify(spec, null, 2)}`
        : `Task: ${question}`;

      // ── 2. Agent Kernel plan ───────────────────────────────────
      let plan: Plan | null = null;
      if (mode === "normal") {
        emit("kernel", "skip", "fast path");
      } else {
        emit("kernel", "start");
        try {
          const { text } = await generateText({
            model: brain.model,
            system: KERNEL,
            prompt: specBlock,
            temperature: 0.1,
          });
          plan = parseJson<Plan>(text);
          emit("kernel", "done", `${plan?.steps?.length ?? 0} steps`);
        } catch {
          emit("kernel", "skip", "planner unavailable");
        }
      }

      const planBlock = plan ? `\n\nKernel plan:\n${JSON.stringify(plan, null, 2)}` : "";
      const needsCode = plan?.needs_code || spec?.task_type === "code";
      const executor = needsCode ? pick(DEEPSEEK_CODE, fallback) : brain;

      // ── 3. Harness agent (A1) — draft, behind the scenes ───────
      let draft = "";
      if (mode === "normal") {
        emit("harness", "skip", "single pass");
      } else {
        emit("harness", "start");
        try {
          const { text } = await generateText({
            model: executor.model,
            system: `${HARNESS}\n\n${specBlock}${planBlock}`,
            messages: modelMessages,
          });
          draft = text.trim();
          emit("harness", draft ? "done" : "skip", draft ? `${draft.length} chars` : "empty");
        } catch {
          emit("harness", "skip", "harness unavailable");
        }
      }

      // ── 4. Hermes agent (A2) — verify + finish, behind the scenes
      emit("hermes", draft && mode === "high" ? "start" : "skip");

      // ── 5. RAG personalization ─────────────────────────────────
      const personal = personalization(opts.context ?? {});
      emit("personalize", personal ? "done" : "skip");

      // ── 6. Stream the final answer ─────────────────────────────
      emit("stream", "start", "Agent Kernel");

      const finalSystem = draft
        ? `${IDENTITY}\n\n${HERMES}\n\n${specBlock}${planBlock}\n\nDraft from the harness agent:\n"""\n${draft}\n"""${personal}`
        : `${IDENTITY}\n\n${HARNESS}\n\n${specBlock}${planBlock}${personal}`;

      const finalModel = draft ? brain : executor;

      const runStream = (model: LanguageModel, system: string) => {
        const result = streamText({
          model,
          system,
          messages: modelMessages,
          onError: (e) => console.error("[kernel] stream error:", e),
        });
        writer.merge(result.toUIMessageStream());
      };

      try {
        runStream(finalModel.model, finalSystem);
      } catch (err) {
        console.error("[kernel] falling back to gateway:", err);
        emit("stream", "skip", "falling back");
        runStream(fallback, `${IDENTITY}\n\n${HARNESS}${personal}`);
      }
    },
  });
}
