import Cookies from "js-cookie";

const AUTH_BASE = "https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/auth";
const REFERRALS_URL = "https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals";

export const TOKEN_COOKIE = "jwt_token";

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE);
}

export function setToken(token: string) {
  Cookies.set(TOKEN_COOKIE, token);
}

export function clearToken() {
  Cookies.remove(TOKEN_COOKIE);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export interface Metric {
  id: string;
  label: string;
  value: string;
  kind?: string;
}

export interface ServiceSummary {
  service: string;
  yourReferrals: string;
  activeReferrals: string;
  totalRefEarnings: string;
}

export interface ReferralShare {
  link: string;
  code: string;
}

export interface ReferralRow {
  id: number;
  name: string;
  serviceName: string;
  date: string;
  profit: number;
}

export interface DashboardData {
  metrics: Metric[];
  serviceSummary: ServiceSummary;
  referral: ReferralShare;
  referrals: ReferralRow[];
}

/** Login: POST email/password, return the JWT from data.token. */
export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${AUTH_BASE}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || "Invalid email or password");
  }
  const token = json?.data?.token;
  if (!token) {
    throw new Error(json?.message || "Invalid email or password");
  }
  return token as string;
}

// The parser must work whether the fields sit under `data` or beside it.
function pickContainer(json: any) {
  const data = json?.data ?? json ?? {};
  return {
    metrics: data.metrics ?? json?.metrics ?? [],
    serviceSummary: data.serviceSummary ??
      json?.serviceSummary ?? {
        service: "",
        yourReferrals: "",
        activeReferrals: "",
        totalRefEarnings: "",
      },
    referral: data.referral ?? json?.referral ?? { link: "", code: "" },
    referrals: data.referrals ?? json?.referrals ?? [],
    data,
  };
}

async function authedGet(params: string): Promise<any> {
  const token = getToken();
  const res = await fetch(`${REFERRALS_URL}${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.message || "Failed to load referrals";
    throw new Error(`${msg} (${res.status})`);
  }
  return json;
}

/** Dashboard list, optionally filtered by search and sorted by date. */
export async function fetchDashboard(
  search?: string,
  sort: "asc" | "desc" = "desc",
): Promise<DashboardData> {
  const qs = new URLSearchParams();
  if (search && search.trim()) qs.set("search", search.trim());
  if (sort) qs.set("sort", sort);
  const query = qs.toString();
  const json = await authedGet(query ? `?${query}` : "");
  const c = pickContainer(json);
  return {
    metrics: c.metrics,
    serviceSummary: c.serviceSummary,
    referral: c.referral,
    referrals: c.referrals,
  };
}

/** Single referral by id. The data field may be the row itself or a list. */
export async function fetchReferralById(id: string): Promise<ReferralRow | null> {
  const json = await authedGet(`?id=${encodeURIComponent(id)}`);
  const c = pickContainer(json);
  const wanted = String(id);

  // Case 1: data is the row object itself
  const direct = c.data;
  if (direct && direct.id != null && String(direct.id) === wanted && direct.name) {
    return direct as ReferralRow;
  }
  // Case 2: row sits inside the referrals array
  const fromList = (c.referrals as ReferralRow[]).find((r) => String(r.id) === wanted);
  return fromList ?? null;
}

/** Date: ISO YYYY-MM-DD -> YYYY/MM/DD */
export function formatDate(iso: string): string {
  if (!iso) return "";
  return iso.slice(0, 10).replace(/-/g, "/");
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Profit: USD currency, no decimals, en-US (e.g. $1,234) */
export function formatProfit(value: number): string {
  return usd.format(value ?? 0);
}