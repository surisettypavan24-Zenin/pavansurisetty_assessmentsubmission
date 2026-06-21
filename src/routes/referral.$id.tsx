import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { fetchReferralById, formatDate, formatProfit } from "@/lib/api";

export const Route = createFileRoute("/referral/$id")({
  head: () => ({
    meta: [
      { title: "Referral Details · Go Business" },
      { name: "description", content: "Full information for this referral partner." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <ReferralDetail />
    </ProtectedRoute>
  ),
});

function ReferralDetail() {
  const { id } = Route.useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["referral", id],
    queryFn: () => fetchReferralById(id),
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link to="/" className="text-sm font-bold text-primary hover:text-primary/80">
          ← Back to dashboard
        </Link>

        {isLoading && <p className="mt-8 text-muted-foreground">Loading referral…</p>}

        {!isLoading && (isError || !data) && (
          <div className="mt-16 text-center">
            <h1 className="text-2xl font-extrabold text-foreground">
              Referral not found
            </h1>
            <Link
              to="/"
              className="mt-4 inline-block font-bold text-primary hover:text-primary/80"
            >
              Back to dashboard
            </Link>
          </div>
        )}

        {!isLoading && data && (
          <>
            <h1 className="mt-6 text-3xl font-extrabold text-foreground sm:text-4xl">
              Referral Details
            </h1>
            <p className="mt-2 text-muted-foreground">
              Full information for this referral partner.
            </p>

            <div className="mt-8 rounded-2xl bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between border-b border-border pb-6">
                <h2 className="text-2xl font-extrabold text-foreground">{data.name}</h2>
                <span className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                  {data.serviceName}
                </span>
              </div>

              <dl className="divide-y divide-border">
                <DetailRow label="Referral ID" value={String(data.id)} />
                <DetailRow label="Name" value={data.name} />
                <DetailRow label="Service Name" value={data.serviceName} />
                <DetailRow label="Date" value={formatDate(data.date)} />
                <DetailRow label="Profit" value={formatProfit(data.profit)} />
              </dl>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-5 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-lg font-bold text-foreground">{value}</dd>
    </div>
  );
}