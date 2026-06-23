import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — TriniAI" },
      { name: "description", content: "AI Tutor, flashcards, exam mode, career roadmap." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModuleStub
      title="Learn"
      subtitle="AI Tutor, flashcards, exam mode, career roadmap."
      icon={GraduationCap}
      pages={["AI Tutor","Study Assistant","Flashcards","Exam Mode","Career Roadmap","Progress","Streaks","Achievements"]}
    />
  ),
});
