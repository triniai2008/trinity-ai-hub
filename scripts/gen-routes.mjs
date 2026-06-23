#!/usr/bin/env bun
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// Mirror src/lib/modules.ts (minimal)
const MODULES = [
  { key: "home", label: "Home", path: "/home", pages: [
    ["", "Dashboard"], ["recent", "Recent Chats"], ["actions", "Quick Actions"], ["suggestions", "AI Suggestions"],
  ]},
  { key: "chat", label: "Chat", path: "/chat", pages: [
    // index handled separately
    ["history", "Chat History"], ["pinned", "Pinned Chats"], ["shared", "Shared Chats"], ["search", "Search Chats"], ["voice", "Voice Chat"],
  ]},
  { key: "imagine", label: "Imagine", path: "/imagine", pages: [
    ["", "Image Generator"], ["image-editor", "Image Editor"], ["image-history", "Image History"],
    ["video", "Video Generator"], ["video-history", "Video History"], ["music", "Music Generator"],
    ["voice", "Voice Generator"], ["voice-clone", "Voice Cloning"], ["three-d", "Text to 3D"], ["three-d-history", "3D History"],
  ]},
  { key: "code", label: "Code", path: "/code", pages: [
    ["", "Projects"], ["files", "File Manager"], ["editor", "Editor"], ["assistant", "AI Assistant"],
    ["terminal", "Terminal"], ["preview", "Live Preview"], ["github", "GitHub"],
  ]},
  { key: "explore", label: "Explore", path: "/explore", pages: [
    ["", "Search"], ["research", "Deep Research"], ["pdf", "PDF Reader"], ["web", "Web Pages"],
    ["youtube", "YouTube Search"], ["flashcards", "Flashcards"], ["quiz", "Quiz Generator"], ["mindmaps", "Mind Maps"],
  ]},
  { key: "agents", label: "Agents", path: "/agents", pages: [
    ["", "Trinity Agent"], ["research", "Research Agent"], ["coding", "Coding Agent"],
    ["image", "Image Agent"], ["video", "Video Agent"], ["audio", "Audio Agent"],
    ["browser", "Browser Agent"], ["planner", "Planner Agent"], ["memory", "Memory Agent"], ["judge", "Judge Agent"],
  ]},
  { key: "models", label: "Models", path: "/models", pages: [
    ["", "Installed Models"], ["cloud", "Cloud Models"], ["download", "Download Models"],
    ["upload", "Upload Models"], ["ollama", "Ollama Models"], ["marketplace", "Model Marketplace"],
  ]},
  { key: "mcp", label: "MCP Hub", path: "/mcp", pages: [
    ["", "Installed MCPs"], ["canva", "Canva MCP"], ["github", "GitHub MCP"], ["figma", "Figma MCP"],
    ["drive", "Google Drive MCP"], ["search", "Search MCP"], ["research", "Deep Research MCP"], ["browser", "Browser MCP"],
  ]},
  { key: "workspace", label: "Workspace", path: "/workspace", pages: [
    ["", "Notes"], ["files", "Files"], ["documents", "Documents"], ["tasks", "Tasks"], ["calendar", "Calendar"], ["projects", "Projects"],
  ]},
  { key: "community", label: "Community", path: "/community", pages: [
    ["", "Teams"], ["projects", "Shared Projects"], ["templates", "Templates"], ["leaderboard", "Leaderboard"],
  ]},
  { key: "learn", label: "Learn", path: "/learn", pages: [
    ["", "AI Tutor"], ["study", "Study Assistant"], ["exam", "Exam Mode"], ["career", "Career Roadmap"],
  ]},
  { key: "profile", label: "Profile", path: "/profile", pages: [
    ["", "Account"], ["stats", "Statistics"], ["subscription", "Subscription"], ["security", "Security"],
  ]},
  { key: "settings", label: "Settings", path: "/settings", pages: [
    ["", "General"], ["appearance", "Appearance"], ["ai", "AI Settings"], ["voice", "Voice Settings"],
    ["memory", "Memory Settings"], ["privacy", "Privacy"], ["notifications", "Notifications"],
    ["language", "Language"], ["integrations", "Integrations"], ["backup", "Backup"],
  ]},
  { key: "admin", label: "Admin", path: "/admin", pages: [
    ["", "Dashboard"], ["users", "Users"], ["logs", "Chat Logs"], ["models", "Models"], ["mcp", "MCP Hub"],
    ["keys", "API Keys"], ["analytics", "Analytics"], ["moderation", "Moderation"], ["broadcast", "Broadcast Center"],
    ["prompts", "Prompt Library"], ["security", "Security Logs"], ["backup", "Backup & Restore"],
    ["health", "System Health"], ["limits", "Limits & Roles"], ["training", "Training Dataset"],
  ]},
];

const ROUTES_DIR = "src/routes";

function moduleLayoutFile(mod) {
  return `import { createFileRoute } from "@tanstack/react-router";
import { ModuleLayout } from "@/components/module-layout";

export const Route = createFileRoute("${mod.path}")({
  head: () => ({
    meta: [
      { title: "${mod.label} — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <ModuleLayout moduleKey="${mod.key}" />,
});
`;
}

function subPageFile(mod, slug, label) {
  const routePath = slug ? `${mod.path}/${slug}` : `${mod.path}/`;
  return `import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("${routePath}")({
  head: () => ({
    meta: [
      { title: "${label} — ${mod.label} — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="${mod.key}" slug="${slug}" />,
});
`;
}

const SKIP_INDEX = new Set(["chat", "home"]); // already exist or special

for (const mod of MODULES) {
  // module layout
  if (mod.key !== "chat") {
    writeFileSync(join(ROUTES_DIR, `${mod.key}.tsx`), moduleLayoutFile(mod));
  }
  for (const [slug, label] of mod.pages) {
    const fname = slug
      ? `${mod.key}.${slug}.tsx`
      : `${mod.key}.index.tsx`;
    if (slug === "" && SKIP_INDEX.has(mod.key)) continue;
    writeFileSync(join(ROUTES_DIR, fname), subPageFile(mod, slug, label));
  }
}

console.log("done");
