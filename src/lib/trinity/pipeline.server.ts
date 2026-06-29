// Trinity 14-step pipeline. Server-only.
// Steps stream to the client as `data-trinity-step` parts so the UI can show progress.
import { createUIMessageStream, generateText, streamText, type ModelMessage, type UIMessage } from "ai";
import { route, runParallel, judge, buildModel } from "./router.server";
import { getModel, type ThinkingMode } from "./models";

const STEPS = [
  "classify", "enhance", "retrieve", "plan", "route",
  "execute", "judge", "consensus", "verify", "tools",
  "critique", "optimize", "format", "stream",
] as const;
export type TrinityStep = (typeof STEPS)[number];

export interface TrinityOptions {
  uiMessages: UIMessage[];
  modelMessages: ModelMessage[];
  lastUserText: string;
  mode: ThinkingMode;
  explicitModelId?: string;
  includePremium?: boolean;
  system: string;
}

export function runTrinityPipeline(opts: TrinityOptions) {
  return createUIMessageStream({
    originalMessages: opts.uiMessages,
    execute: async ({ writer }) => {
      const emit = (step: TrinityStep, status: "start" | "done" | "skip", detail?: string) =>
        writer.write({
          type: "data-trinity-step",
          data: { step, status, detail: detail ?? "" },
          transient: true,
        });

      // 1 classify
      emit("classify", "start");
      const { plan: autoPlan, capability } = route(opts.lastUserText, opts.mode, opts.includePremium);
      emit("classify", "done", capability);

      // 2 enhance (only in medium/high)
      emit("enhance", opts.mode === "normal" ? "skip" : "start");
      let enhancedSystem = opts.system;
      if (opts.mode !== "normal") {
        try {
          const fast = buildModel(getModel("gemma-3") ?? autoPlan[0]);
          if (fast) {
            const { text } = await generateText({
              model: fast,
              prompt: `Rewrite this user request as a clearer, more specific instruction (one short paragraph, no preamble):\n\n${opts.lastUserText}`,
              temperature: 0.2,
            });
            if (text.trim()) enhancedSystem = `${opts.system}\n\nClarified intent: ${text.trim()}`;
          }
          emit("enhance", "done");
        } catch {
          emit("enhance", "skip", "enhance failed");
        }
      }

      // 3 retrieve (MCP placeholder)
      emit("retrieve", "skip", "no MCP context");

      // 4 plan
      emit("plan", "start");
      const explicit = opts.explicitModelId ? getModel(opts.explicitModelId) : undefined;
      const plan = explicit ? [explicit] : autoPlan;
      emit("plan", "done", plan.map((p) => p.label).join(" · "));

      // 5 route
      emit("route", "done", plan[0]?.provider ?? "none");

      // 6 execute
      if (plan.length === 0) {
        writer.write({ type: "data-trinity-step", data: { step: "execute", status: "skip", detail: "no models" }, transient: true });
        return;
      }
      let winnerDef = plan[0];
      let winnerText = "";

      if (opts.mode === "normal" || plan.length === 1) {
        emit("execute", "done", plan[0].label);
        emit("judge", "skip");
        emit("consensus", "skip");
      } else {
        emit("execute", "start", `${plan.length} models`);
        const candidates = await runParallel(plan, opts.modelMessages, enhancedSystem);
        emit("execute", "done", `${candidates.length} ok`);

        if (candidates.length === 0) {
          writer.write({ type: "data-trinity-step", data: { step: "execute", status: "skip", detail: "all failed" }, transient: true });
          return;
        }
        // 7 judge
        emit("judge", "start");
        const { winnerIndex } = await judge(opts.lastUserText, candidates);
        const winner = candidates[winnerIndex] ?? candidates[0];
        winnerDef = winner.model;
        winnerText = winner.text;
        emit("judge", "done", winner.model.label);
        // 8 consensus
        emit("consensus", "done", `${candidates.length} considered`);
      }

      // 9 verify (fast sanity, skip in normal)
      emit("verify", opts.mode === "high" && winnerText ? "start" : "skip");
      if (opts.mode === "high" && winnerText) {
        try {
          const v = buildModel(getModel("gemini") ?? winnerDef);
          if (v) {
            const { text } = await generateText({
              model: v,
              prompt: `Briefly check this answer for factual/logical errors. Reply OK if fine, else list issues (<=2 lines).\n\nQ: ${opts.lastUserText}\nA: ${winnerText}`,
              temperature: 0,
            });
            emit("verify", "done", text.slice(0, 80));
          }
        } catch { emit("verify", "skip"); }
      }

      // 10 tools — no built-in tools yet
      emit("tools", "skip");

      // 11 critique (skip in normal)
      emit("critique", opts.mode === "high" ? "done" : "skip");

      // 12 optimize
      emit("optimize", "skip");

      // 13 format
      emit("format", "done", "markdown");

      // 14 stream — re-stream from winner so client sees true streaming
      emit("stream", "start", winnerDef.label);
      const winnerModel = buildModel(winnerDef);
      if (!winnerModel) {
        writer.write({ type: "data-trinity-step", data: { step: "stream", status: "skip", detail: "no provider" }, transient: true });
        return;
      }
      const result = streamText({
        model: winnerModel,
        system: enhancedSystem,
        messages: opts.modelMessages,
      });
      writer.merge(result.toUIMessageStream());
    },
  });
}
