import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { fetchDashboard, formatDate, formatProfit, type ReferralRow } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Referral Dashboard · Go Business" },
      {
        name: "description",
        content: "Track your referrals, earnings, and partner activity in one place.",
      },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
});

const PAGE_SIZE = 10;

function Dashboard() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  // Debounce search input -> triggers a new API call
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset to page 1 whenever the filter/sort changes
  useEffect(() => {
    setPage(1);
  }, [search, sort]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", search, sort],
    queryFn: () => fetchDashboard(search, sort),
  });

  const referrals = data?.referrals ?? [];
  const total = referrals.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = referrals.slice(start, start + PAGE_SIZE);
  const from = total === 0 ? 0 : start + 1;
  const to = Math.min(start + PAGE_SIZE, total);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages],
  );

  const copy = async (text: string, which: "link" | "code") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  const goToReferral = (row: ReferralRow) => {
    navigate({ to: "/referral/$id", params: { id: String(row.id) } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
          Referral Dashboard
        </h1>
        <p className="mt-2 max-w-lg text-muted-foreground">
          Track your referrals, earnings, and partner activity in one place.
        </p>

        {isLoading && (
          <p className="mt-8 text-muted-foreground">Loading your dashboard…</p>
        )}

        {isError && (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm font-medium text-destructive"
          >
            {error instanceof Error ? error.message : "Something went wrong."}
          </div>
        )}

        {data && !isLoading && (
          <div className="mt-8 space-y-8">
            {/* Overview */}
            <section
              role="region"
              aria-label="Overview metrics"
              className="rounded-2xl bg-card p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-lg font-bold text-foreground">Overview</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {data.metrics.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl bg-secondary/60 p-5"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground"
                      style={{ backgroundImage: "var(--brand-gradient)" }}
                      aria-hidden="true"
                    >
                      {m.label.charAt(0)}
                    </div>
                    <p className="mt-4 text-2xl font-extrabold text-foreground">
                      {m.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Service summary */}
            <section
              aria-label="Service summary"
              className="rounded-2xl bg-card p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-lg font-bold text-foreground">Service summary</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCell label="Service">
                  <span className="font-bold text-primary">
                    {data.serviceSummary.service}
                  </span>
                </SummaryCell>
                <SummaryCell label="Your Referrals">
                  {data.serviceSummary.yourReferrals}
                </SummaryCell>
                <SummaryCell label="Active Referrals">
                  {data.serviceSummary.activeReferrals}
                </SummaryCell>
                <SummaryCell label="Total Ref. Earnings">
                  {data.serviceSummary.totalRefEarnings}
                </SummaryCell>
              </div>
            </section>

            {/* Share referral */}
            <section
              aria-label="Share referral"
              className="rounded-2xl bg-card p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-lg font-bold text-foreground">
                Refer friends and earn more
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Your Referral Link
                  </p>
                  <div className="mt-2 flex gap-3">
                    <input
                      readOnly
                      value={data.referral.link}
                      aria-label="Your Referral Link"
                      className="w-full rounded-lg border border-input bg-secondary/50 px-4 py-2.5 text-sm text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => copy(data.referral.link, "link")}
                      className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      {copied === "link" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Your Referral Code
                  </p>
                  <div className="mt-2 flex gap-3">
                    <input
                      readOnly
                      value={data.referral.code}
                      aria-label="Your Referral Code"
                      className="w-full rounded-lg border border-input bg-secondary/50 px-4 py-2.5 text-sm text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => copy(data.referral.code, "code")}
                      className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      {copied === "code" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* All referrals */}
            <section className="rounded-2xl bg-card p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-foreground">All referrals</h2>
              </div>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-3 text-sm text-muted-foreground">
                  Search
                  <input
                    type="text"
                    placeholder="Name or service…"
                    aria-label="Search referrals"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-64 rounded-lg border border-input bg-card px-4 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </label>
                <label className="flex items-center gap-3 text-sm text-muted-foreground">
                  Sort by date
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as "asc" | "desc")}
                    className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-10 text-center text-muted-foreground"
                        >
                          No matching entries
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((row) => (
                        <tr
                          key={row.id}
                          tabIndex={0}
                          role="button"
                          onClick={() => goToReferral(row)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              goToReferral(row);
                            }
                          }}
                          className="cursor-pointer border-b border-border/70 transition-colors hover:bg-secondary/50 focus:bg-secondary/50 focus:outline-none"
                        >
                          <td className="px-4 py-4 font-medium text-foreground">
                            {row.name}
                          </td>
                          <td className="px-4 py-4 text-foreground">{row.serviceName}</td>
                          <td className="px-4 py-4 text-foreground">
                            {formatDate(row.date)}
                          </td>
                          <td className="px-4 py-4 font-semibold text-primary">
                            {formatProfit(row.profit)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  Showing {from}–{to} of {total} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition enabled:hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {totalPages > 1 &&
                    pageNumbers.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        aria-current={n === currentPage ? "page" : undefined}
                        className={
                          n === currentPage
                            ? "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                            : "rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary"
                        }
                      >
                        {n}
                      </button>
                    ))}
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition enabled:hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function SummaryCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-secondary/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-lg font-bold text-foreground">{children}</p>
    </div>
  );
}
