import { Link, useNavigate } from "@tanstack/react-router";
import { clearToken } from "@/lib/api";

export function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate({ to: "/login", replace: true });
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          aria-label="Go to dashboard home"
          className="text-xl font-extrabold text-primary"
        >
          Go Business
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-3">
          <Link
            to="/"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:text-primary sm:inline-flex"
          >
            Home
          </Link>
          <span className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm">
            Try for free
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center rounded-full border border-destructive/30 px-5 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}