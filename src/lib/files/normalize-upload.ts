import { unzipSync } from "fflate";

import {
  assertFileSizes,
  assertHasIndexHtml,
  filterAllowedFiles,
  stripCommonRootPrefix,
  type NormalizedFile,
} from "./allowed-paths";

function decodePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

function filesFromZip(buffer: Buffer): NormalizedFile[] {
  const entries = unzipSync(new Uint8Array(buffer));
  const files: NormalizedFile[] = [];

  for (const [path, data] of Object.entries(entries)) {
    if (path.endsWith("/")) {
      continue;
    }

    files.push({
      relativePath: decodePath(path),
      buffer: Buffer.from(data),
    });
  }

  return files;
}

function isFileLike(value: FormDataEntryValue): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

async function filesFromFormData(formData: FormData): Promise<NormalizedFile[]> {
  const files: NormalizedFile[] = [];

  for (const [key, value] of formData.entries()) {
    if (!isFileLike(value)) {
      continue;
    }

    if (key !== "files" && key !== "file") {
      continue;
    }

    const relativePath = value.name.replace(/\\/g, "/").replace(/^\/+/, "");
    files.push({
      relativePath,
      buffer: Buffer.from(await value.arrayBuffer()),
    });
  }

  return files;
}

export async function normalizeUpload(formData: FormData): Promise<NormalizedFile[]> {
  let files = await filesFromFormData(formData);

  if (files.length === 1 && files[0].relativePath.toLowerCase().endsWith(".zip")) {
    files = filesFromZip(files[0].buffer);
  }

  if (files.length === 0) {
    throw new Error("No files were uploaded.");
  }

  files = stripCommonRootPrefix(files);
  files = filterAllowedFiles(files);
  assertFileSizes(files);
  assertHasIndexHtml(files);

  return files;
}
