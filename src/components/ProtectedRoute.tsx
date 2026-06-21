import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { isAuthenticated } from "@/lib/api";

/**
 * Renders children only when the jwt_token cookie exists.
 * Otherwise redirects to /login. The Not Found route is NOT wrapped in this.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setAllowed(true);
    } else {
      navigate({ to: "/login", replace: true });
    }
  }, [navigate]);

  if (!allowed) return null;
  return <>{children}</>;
}