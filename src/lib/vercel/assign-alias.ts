import { getBaseDomain, getJsonHeaders, vercelFetch } from "./client";

type AssignAliasResponse = {
  uid: string;
  alias: string;
  created: string;
};

export async function assignDeploymentAlias(
  deploymentId: string,
  slug: string,
): Promise<{ alias: string; url: string }> {
  const alias = `${slug}.${getBaseDomain()}`;

  await vercelFetch<AssignAliasResponse>(`/v2/deployments/${deploymentId}/aliases`, {
    method: "POST",
    headers: getJsonHeaders(),
    body: JSON.stringify({ alias }),
  });

  return {
    alias,
    url: `https://${alias}`,
  };
}
