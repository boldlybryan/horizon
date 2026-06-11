import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

function getAuthSecret(): string {
  const fromEnv = process.env.BETTER_AUTH_SECRET;
  if (fromEnv) {
    return fromEnv;
  }
  if (process.env.NODE_ENV !== "production") {
    return "horizon-local-dev-secret-min-32-characters";
  }
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return "horizon-build-placeholder-secret-min-32-chars";
  }
  throw new Error("BETTER_AUTH_SECRET is required in production.");
}

function getTrustedOrigins(): string[] {
  const isProd = process.env.NODE_ENV === "production";
  const explicit = [process.env.BETTER_AUTH_URL]
    .filter(Boolean)
    .map((value) => value!.replace(/\/+$/, ""));

  const fallback = !isProd && explicit.length === 0 ? ["http://localhost:3000"] : [];
  const devWildcards = !isProd
    ? ["http://localhost:*", "http://127.0.0.1:*", "http://192.168.*:*"]
    : [];

  return [...new Set([...explicit, ...fallback, ...devWildcards])];
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const allowedDomain = process.env.GOOGLE_ALLOWED_DOMAIN;

export const auth = betterAuth({
  secret: getAuthSecret(),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: getTrustedOrigins(),
  plugins: [nextCookies()],
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            ...(allowedDomain ? { hd: allowedDomain } : {}),
          },
        }
      : {},
});

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export function toSessionUser(user: {
  id: string;
  email: string;
  name?: string | null;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? user.email,
  };
}
