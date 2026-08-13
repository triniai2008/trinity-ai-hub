import { Logo } from "@/components/logo";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertCircle, Mail, KeyRound, Chrome, UserPlus, LogIn } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — TriniAI" },
      { name: "description", content: "Sign in or create your TriniAI account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { next?: string } => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: AuthPage,
});

function safeNext(next: string | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

type AuthAction = {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
};

type AuthError = {
  title: string;
  detail: string;
  actions?: AuthAction[];
};

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const returnTo = safeNext(next);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Mode>("signin");
  const [err, setErr] = useState<AuthError | null>(null);

  const goHome = () => {
    if (returnTo) window.location.href = returnTo;
    else navigate({ to: "/home", replace: true });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) goHome();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear error when the user edits inputs or switches tab.
  useEffect(() => {
    setErr(null);
  }, [tab, email, password, name]);

  const resendConfirmation = async () => {
    if (!email) return toast.error("Enter your email first.");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) return toast.error(error.message);
    toast.success("Confirmation email sent. Check your inbox.");
  };

  const sendPasswordReset = async () => {
    if (!email) return toast.error("Enter your email first.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Password reset link sent. Check your inbox.");
  };

  // Best-effort classifier that maps Supabase errors to a friendly, actionable UI.
  const classifySignIn = (raw: string): AuthError => {
    const m = raw.toLowerCase();
    if (m.includes("email not confirmed") || m.includes("not confirmed")) {
      return {
        title: "Email not confirmed",
        detail: "We sent a confirmation link when you signed up. Confirm it, then sign in.",
        actions: [
          { label: "Resend confirmation email", onClick: resendConfirmation, icon: Mail },
        ],
      };
    }
    if (m.includes("invalid login") || m.includes("invalid_credentials") || m.includes("invalid")) {
      return {
        title: "Wrong email or password",
        detail:
          "Double-check both. If this account was created with Google, use Continue with Google instead.",
        actions: [
          { label: "Reset password", onClick: sendPasswordReset, icon: KeyRound },
          { label: "Continue with Google", onClick: () => void google(), icon: Chrome },
        ],
      };
    }
    if (m.includes("user not found") || m.includes("no user")) {
      return {
        title: "No account with that email",
        detail: "Create one in a few seconds, or try a different email.",
        actions: [
          { label: "Create account", onClick: () => setTab("signup"), icon: UserPlus },
        ],
      };
    }
    if (m.includes("rate") || m.includes("too many")) {
      return {
        title: "Too many attempts",
        detail: "Wait a minute before trying again, or reset your password.",
        actions: [{ label: "Reset password", onClick: sendPasswordReset, icon: KeyRound }],
      };
    }
    return { title: "Sign-in failed", detail: raw };
  };

  const classifySignUp = (raw: string): AuthError => {
    const m = raw.toLowerCase();
    if (m.includes("already") || m.includes("registered") || m.includes("exists")) {
      return {
        title: "Email already registered",
        detail: "Sign in instead, or reset your password if you forgot it.",
        actions: [
          { label: "Go to sign in", onClick: () => setTab("signin"), icon: LogIn },
          { label: "Reset password", onClick: sendPasswordReset, icon: KeyRound },
        ],
      };
    }
    if (m.includes("weak") || m.includes("pwned") || m.includes("password")) {
      return {
        title: "Password too weak",
        detail: "Use at least 8 characters with a mix of letters, numbers, or symbols.",
      };
    }
    if (m.includes("valid email") || m.includes("invalid email")) {
      return { title: "Invalid email", detail: "Enter a valid email address." };
    }
    if (m.includes("rate") || m.includes("too many")) {
      return { title: "Too many attempts", detail: "Wait a minute and try again." };
    }
    return { title: "Sign-up failed", detail: raw };
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setErr(classifySignIn(error.message));
    goHome();
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const emailRedirectTo = returnTo
      ? window.location.origin + returnTo
      : window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo },
    });
    if (error) {
      setBusy(false);
      return setErr(classifySignUp(error.message));
    }
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setBusy(false);
        setErr({
          title: "Confirm your email to finish",
          detail: "We sent a confirmation link to " + email + ". Open it, then sign in.",
          actions: [
            { label: "Resend confirmation email", onClick: resendConfirmation, icon: Mail },
            { label: "Go to sign in", onClick: () => setTab("signin"), icon: LogIn },
          ],
        });
        return;
      }
    }
    setBusy(false);
    toast.success("Account created. You're in.");
    goHome();
  };

  const google = async () => {
    setErr(null);
    setBusy(true);
    const redirect_uri = returnTo
      ? window.location.origin + returnTo
      : window.location.origin;
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri });
    if (result.error) {
      setBusy(false);
      const msg = (result.error as Error).message ?? "Google sign-in failed";
      return setErr({ title: "Google sign-in failed", detail: msg });
    }
    if (result.redirected) return;
    goHome();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <Logo className="h-10 w-10 rounded-lg" />
          <span className="text-base font-semibold">TriniAI</span>
        </Link>

        <div className="rounded-xl border border-border bg-card p-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Mode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            {err && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-destructive">{err.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{err.detail}</p>
                    {err.actions && err.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {err.actions.map((a) => {
                          const Icon = a.icon;
                          return (
                            <Button
                              key={a.label}
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1.5 text-xs"
                              onClick={a.onClick}
                              disabled={busy}
                            >
                              {Icon && <Icon className="h-3.5 w-3.5" />}
                              {a.label}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-3 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={sendPasswordReset}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Forgot?
                    </button>
                  </div>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-3 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email2">Email</Label>
                  <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password2">Password</Label>
                  <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" disabled={busy} onClick={google}>
            Continue with Google
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to TriniAI's terms.
        </p>
      </div>
    </div>
  );
}
