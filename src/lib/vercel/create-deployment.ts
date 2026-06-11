import { getJsonHeaders, getProjectId, vercelFetch } from "./client";
import { buildDeploymentMeta, type DeploymentMetaInput } from "./meta";
import type { VercelFileReference } from "./upload-files";

export type CreateDeploymentResult = {
  id: string;
  url: string | null;
  readyState?: string;
};

type CreateDeploymentResponse = {
  id: string;
  url: string | null;
  readyState?: string;
};

export async function createDeployment(input: {
  slug: string;
  files: VercelFileReference[];
  meta: DeploymentMetaInput;
}): Promise<CreateDeploymentResult> {
  const body = {
    name: input.slug,
    project: getProjectId(),
    target: "production",
    files: input.files,
    meta: buildDeploymentMeta(input.meta),
    projectSettings: {
      framework: null,
      buildCommand: null,
      installCommand: null,
    },
  };

  const result = await vercelFetch<CreateDeploymentResponse>("/v13/deployments", {
    method: "POST",
    headers: getJsonHeaders(),
    body: JSON.stringify(body),
  });

  return {
    id: result.id,
    url: result.url,
    readyState: result.readyState,
  };
}
