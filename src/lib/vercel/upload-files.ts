import { createHash } from "crypto";

import { buildTeamQuery } from "./client";

export type UploadFile = {
  path: string;
  buffer: Buffer;
  sha: string;
  size: number;
};

const VERCEL_API_BASE = "https://api.vercel.com";
const UPLOAD_CONCURRENCY = 8;

export function hashFile(buffer: Buffer): string {
  return createHash("sha1").update(buffer).digest("hex");
}

export function prepareUploadFiles(
  files: Array<{ relativePath: string; buffer: Buffer }>,
): UploadFile[] {
  return files.map((file) => {
    const sha = hashFile(file.buffer);
    return {
      path: file.relativePath.replace(/\\/g, "/"),
      buffer: file.buffer,
      sha,
      size: file.buffer.byteLength,
    };
  });
}

async function uploadSingleFile(file: UploadFile, token: string): Promise<void> {
  const response = await fetch(`${VERCEL_API_BASE}/v2/files${buildTeamQuery()}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      "Content-Length": String(file.size),
      "x-vercel-digest": file.sha,
    },
    body: new Uint8Array(file.buffer),
  });

  if (response.ok || response.status === 409) {
    return;
  }

  const text = await response.text();
  throw new Error(`Failed to upload ${file.path}: ${response.status} ${text}`);
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;

  async function runWorker() {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      await worker(current);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()),
  );
}

export async function uploadFilesToVercel(files: UploadFile[]): Promise<UploadFile[]> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    throw new Error("VERCEL_TOKEN is not configured");
  }

  await runWithConcurrency(files, UPLOAD_CONCURRENCY, (file) =>
    uploadSingleFile(file, token),
  );

  return files;
}

export type VercelFileReference = {
  file: string;
  sha: string;
  size: number;
};

export function toFileReferences(files: UploadFile[]): VercelFileReference[] {
  return files.map((file) => ({
    file: file.path,
    sha: file.sha,
    size: file.size,
  }));
}
