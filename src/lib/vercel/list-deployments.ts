import { getProjectId, getBaseDomain, vercelFetch } from "./client";
import { HORIZON_META_KEY, type HorizonDeploymentMeta } from "./meta";

export type HorizonDeploymentListItem = {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  url: string;
  userEmail: string;
  userName: string;
  deployedAt: string;
  state: string;
};

type VercelDeployment = {
  uid: string;
  url: string | null;
  state: string;
  created: number;
  meta?: Record<string, string>;
};

type ListDeploymentsResponse = {
  deployments: VercelDeployment[];
};

function normalizeDeployment(deployment: VercelDeployment): HorizonDeploymentListItem | null {
  const meta = (deployment.meta ?? {}) as HorizonDeploymentMeta & Record<string, string>;
  if (meta[HORIZON_META_KEY] !== "1") {
    return null;
  }

  const slug = meta.slug ?? "";
  if (!slug) {
    return null;
  }

  const baseDomain = getBaseDomain();

  return {
    id: deployment.uid,
    slug,
    displayName: meta.displayName ?? slug,
    description: meta.description ?? "",
    url: `https://${slug}.${baseDomain}`,
    userEmail: meta.userEmail ?? "",
    userName: meta.userName ?? "",
    deployedAt: meta.deployedAt ?? new Date(deployment.created).toISOString(),
    state: deployment.state,
  };
}

export async function listHorizonDeployments(limit = 100): Promise<HorizonDeploymentListItem[]> {
  const response = await vercelFetch<ListDeploymentsResponse>("/v6/deployments", {
    query: {
      projectId: getProjectId(),
      [`meta-${HORIZON_META_KEY}`]: "1",
      limit,
    },
  });

  return response.deployments
    .map(normalizeDeployment)
    .filter((item): item is HorizonDeploymentListItem => item !== null)
    .sort(
      (a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime(),
    );
}
