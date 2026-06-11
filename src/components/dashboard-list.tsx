"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DeploymentCard } from "@/components/deployment-card";
import type { HorizonDeploymentListItem } from "@/lib/vercel/list-deployments";

export function DashboardList() {
  const [deployments, setDeployments] = useState<HorizonDeploymentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDeployments() {
      try {
        const response = await fetch("/api/deployments");
        const data = (await response.json()) as {
          deployments?: HorizonDeploymentListItem[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "Failed to load deployments.");
        }

        setDeployments(data.deployments ?? []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load deployments.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDeployments();
  }, []);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading deployments...</p>;
  }

  if (deployments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-12 text-center">
        <p className="text-base font-medium">No deployments yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Deploy your first static site to see it listed here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {deployments.map((deployment) => (
        <DeploymentCard key={deployment.id} deployment={deployment} />
      ))}
    </div>
  );
}
