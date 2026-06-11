const BLOCKED_SEGMENTS = new Set([
  ".git",
  "node_modules",
  ".next",
  ".vercel",
  "__MACOSX",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".html",
  ".htm",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".txt",
  ".xml",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".map",
  ".md",
  ".webmanifest",
]);

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export type NormalizedFile = {
  relativePath: string;
  buffer: Buffer;
};

function getExtension(path: string): string {
  const index = path.lastIndexOf(".");
  if (index === -1) {
    return "";
  }
  return path.slice(index).toLowerCase();
}

function isBlockedPath(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const segments = normalized.split("/");

  if (segments.some((segment) => BLOCKED_SEGMENTS.has(segment))) {
    return true;
  }

  if (normalized.includes("..")) {
    return true;
  }

  const baseName = segments.at(-1) ?? "";
  if (baseName === ".DS_Store" || baseName.startsWith(".")) {
    return true;
  }

  const extension = getExtension(baseName);
  if (!extension) {
    return false;
  }

  return !ALLOWED_EXTENSIONS.has(extension);
}

export function filterAllowedFiles(files: NormalizedFile[]): NormalizedFile[] {
  return files.filter((file) => !isBlockedPath(file.relativePath));
}

export function assertHasIndexHtml(files: NormalizedFile[]): void {
  const hasIndex = files.some((file) => {
    const path = file.relativePath.replace(/\\/g, "/").toLowerCase();
    return path === "index.html" || path.endsWith("/index.html") || path === "index.htm";
  });

  if (!hasIndex) {
    throw new Error("Upload must include an index.html file.");
  }
}

export function assertFileSizes(files: NormalizedFile[]): void {
  for (const file of files) {
    if (file.buffer.byteLength > MAX_FILE_SIZE) {
      throw new Error(`File exceeds 25MB limit: ${file.relativePath}`);
    }
  }
}

export function stripCommonRootPrefix(files: NormalizedFile[]): NormalizedFile[] {
  if (files.length === 0) {
    return files;
  }

  const paths = files.map((file) => file.relativePath.replace(/\\/g, "/"));
  const firstSegments = paths[0].split("/");

  if (firstSegments.length === 1) {
    return files;
  }

  const rootPrefix = `${firstSegments[0]}/`;
  const allSharePrefix = paths.every((path) => path.startsWith(rootPrefix));

  if (!allSharePrefix) {
    return files;
  }

  return files.map((file) => ({
    ...file,
    relativePath: file.relativePath.replace(/\\/g, "/").slice(rootPrefix.length),
  }));
}
