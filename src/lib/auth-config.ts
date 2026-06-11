export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

/** Bypass Google OAuth when DISABLE_AUTH=true (use only for trusted internal deployments). */
export function isAuthDisabled(): boolean {
  return process.env.DISABLE_AUTH === "true";
}

export function getDevUser(): SessionUser {
  return {
    id: "dev-user",
    email: process.env.DEV_USER_EMAIL || "dev@localhost",
    name: process.env.DEV_USER_NAME || "Dev User",
  };
}
