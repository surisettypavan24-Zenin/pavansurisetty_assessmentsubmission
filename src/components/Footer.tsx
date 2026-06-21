import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <Link to="/" className="text-lg font-extrabold text-primary">
          Go Business
        </Link>
        <nav aria-label="Footer" className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#about" className="transition-colors hover:text-primary">
            About
          </a>
          <a href="#contact" className="transition-colors hover:text-primary">
            Contact
          </a>
          <a href="#privacy" className="transition-colors hover:text-primary">
            Privacy
          </a>
          <a href="#terms" className="transition-colors hover:text-primary">
            Terms
          </a>
        </nav>
        <p className="text-sm text-muted-foreground">© 2024 Go Business, Inc.</p>
      </div>
    </footer>
  );
}