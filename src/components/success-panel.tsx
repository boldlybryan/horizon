"use client";

import { ExternalLink, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SuccessPanelProps = {
  url: string;
  slug: string;
  displayName: string;
};

export function SuccessPanel({ url, slug, displayName }: SuccessPanelProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Deployment live</CardTitle>
        <CardDescription>
          {displayName} is available at your custom subdomain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm font-medium break-all">
          {url}
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants())}
          >
            <ExternalLink className="size-4" />
            Open
          </a>
          <Button variant="outline" onClick={handleCopy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Link href="/deploy" className={cn(buttonVariants({ variant: "ghost" }))}>
            Deploy another
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Slug: <span className="font-medium text-foreground">{slug}</span>
        </p>
      </CardContent>
    </Card>
  );
}
