import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { HorizonDeploymentListItem } from "@/lib/vercel/list-deployments";

type DeploymentCardProps = {
  deployment: HorizonDeploymentListItem;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function DeploymentCard({ deployment }: DeploymentCardProps) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{deployment.displayName}</CardTitle>
            <CardDescription>{deployment.description}</CardDescription>
          </div>
          <Badge variant={deployment.state === "READY" ? "default" : "secondary"}>
            {deployment.state}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1 text-sm">
          <p className="font-medium break-all">{deployment.url}</p>
          <p className="text-muted-foreground">
            {deployment.userEmail || deployment.userName} · {formatDate(deployment.deployedAt)}
          </p>
        </div>
        <Link
          href={deployment.url}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ExternalLink className="size-4" />
          Open site
        </Link>
      </CardContent>
    </Card>
  );
}
