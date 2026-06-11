import { vercelFetch } from "./client";

type DeploymentStatusResponse = {
  id: string;
  url: string | null;
  readyState: string;
  alias?: string[];
};

const READY_STATES = new Set(["READY"]);
const ERROR_STATES = new Set(["ERROR", "CANCELED"]);

export async function waitForDeploymentReady(
  deploymentId: string,
  options?: { intervalMs?: number; timeoutMs?: number },
): Promise<DeploymentStatusResponse> {
  const intervalMs = options?.intervalMs ?? 2000;
  const timeoutMs = options?.timeoutMs ?? 120_000;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const deployment = await vercelFetch<DeploymentStatusResponse>(
      `/v13/deployments/${deploymentId}`,
    );

    if (READY_STATES.has(deployment.readyState)) {
      return deployment;
    }

    if (ERROR_STATES.has(deployment.readyState)) {
      throw new Error(`Deployment failed with state: ${deployment.readyState}`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Deployment timed out before becoming ready");
}
