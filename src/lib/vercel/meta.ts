export const HORIZON_META_KEY = "horizon";

export type DeploymentMetaInput = {
  userId: string;
  userEmail: string;
  userName: string;
  slug: string;
  displayName: string;
  description: string;
};

export function buildDeploymentMeta(input: DeploymentMetaInput): Record<string, string> {
  return {
    [HORIZON_META_KEY]: "1",
    userId: input.userId,
    userEmail: input.userEmail,
    userName: input.userName,
    slug: input.slug,
    displayName: input.displayName,
    description: input.description,
    deployedAt: new Date().toISOString(),
  };
}

export type HorizonDeploymentMeta = {
  slug?: string;
  displayName?: string;
  description?: string;
  userEmail?: string;
  userName?: string;
  deployedAt?: string;
};
