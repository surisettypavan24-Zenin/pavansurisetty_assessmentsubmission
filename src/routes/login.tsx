import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { login, setToken, isAuthenticated } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · Go Business" },
      {
        name: "description",
        content: "Sign in to open your Go Business referral dashboard.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Authenticated users visiting /login are redirected to /
  useEffect(() => {
    if (isAuthenticated()) {
      navigate({ to: "/", replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Read straight from the form so browser autofill values are captured
      // even when React's onChange never fired.
      const form = e.currentTarget as HTMLFormElement;
      const fd = new FormData(form);
      const emailValue = (fd.get("email") as string)?.trim() || email;
      const passwordValue = (fd.get("password") as string) || password;
      const token = await login(emailValue, passwordValue);
      setToken(token);
      navigate({ to: "/", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl sm:p-10">
        <h1 className="text-4xl font-extrabold text-primary">Go Business</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to open your referral dashboard.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-bold text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-bold text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary py-3 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-70"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}