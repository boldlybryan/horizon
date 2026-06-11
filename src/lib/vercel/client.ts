const VERCEL_API_BASE = "https://api.vercel.com";

export class VercelApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: string,
  ) {
    super(message);
    this.name = "VercelApiError";
  }
}

function getToken(): string {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    throw new Error("VERCEL_TOKEN is not configured");
  }
  return token;
}

function getTeamId(): string | undefined {
  return process.env.VERCEL_TEAM_ID || undefined;
}

export function getProjectId(): string {
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!projectId) {
    throw new Error("VERCEL_PROJECT_ID is not configured");
  }
  return projectId;
}

export function getBaseDomain(): string {
  return process.env.HORIZON_BASE_DOMAIN || "navistone.dev";
}

export function buildTeamQuery(extra?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  const teamId = getTeamId();
  if (teamId) {
    params.set("teamId", teamId);
  }
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function vercelFetch<T>(
  path: string,
  init?: RequestInit & { query?: Record<string, string | number | undefined> },
): Promise<T> {
  const { query, ...requestInit } = init ?? {};
  const url = `${VERCEL_API_BASE}${path}${buildTeamQuery(query)}`;
  const response = await fetch(url, {
    ...requestInit,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...requestInit.headers,
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new VercelApiError(
      parseVercelError(text, response.status),
      response.status,
      text,
    );
  }

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

export function parseVercelError(body: string, status: number): string {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string }; message?: string };
    return parsed.error?.message || parsed.message || `Vercel API error (${status})`;
  } catch {
    return body || `Vercel API error (${status})`;
  }
}

export function getJsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}
