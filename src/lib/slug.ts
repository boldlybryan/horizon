const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])?$/;

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "dashboard",
  "deploy",
  "horizon",
  "login",
  "www",
]);

export function validateSlug(slug: string): string | null {
  const normalized = slug.trim().toLowerCase();

  if (normalized.length < 3 || normalized.length > 48) {
    return "Slug must be between 3 and 48 characters.";
  }

  if (!SLUG_PATTERN.test(normalized)) {
    return "Slug may only contain lowercase letters, numbers, and hyphens.";
  }

  if (RESERVED_SLUGS.has(normalized)) {
    return "That slug is reserved. Choose another.";
  }

  return null;
}

export function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}
