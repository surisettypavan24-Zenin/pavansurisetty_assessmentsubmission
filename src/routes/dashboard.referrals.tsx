import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/referrals")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});