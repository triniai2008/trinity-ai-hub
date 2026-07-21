import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoamiTool from "./tools/whoami";
import listChatsTool from "./tools/list-chats";
import rememberTool from "./tools/remember";
import recallTool from "./tools/recall";

// Direct Supabase issuer — never the .lovable.cloud proxy (RFC 8414 issuer mismatch).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "triniai-mcp",
  title: "TriniAI",
  version: "0.1.0",
  instructions:
    "TriniAI agent tools. Use `whoami` to confirm the signed-in user, `list_chats` to browse recent chats, and `remember`/`recall` to persist and search long-term memories for this user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoamiTool, listChatsTool, rememberTool, recallTool],
});
