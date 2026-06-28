import { createFileRoute, redirect } from "@tanstack/react-router";
import { ModuleLayout } from "@/components/module-layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) throw redirect({ to: "/auth" });
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (error || !data) throw redirect({ to: "/home" });
  },
  component: () => <ModuleLayout moduleKey="admin" />,
});
