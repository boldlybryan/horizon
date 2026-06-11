"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DropZone } from "@/components/drop-zone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { validateSlug } from "@/lib/slug";

type DeployFormProps = {
  baseDomain: string;
};

type DeployResponse = {
  ok?: boolean;
  url?: string;
  slug?: string;
  displayName?: string;
  error?: string;
};

function summarizeFiles(files: File[]): string {
  if (files.length === 1 && files[0].name.toLowerCase().endsWith(".zip")) {
    return files[0].name;
  }

  const rootNames = new Set(
    files.map((file) => file.name.split("/")[0]).filter(Boolean),
  );

  if (rootNames.size === 1) {
    return `${rootNames.values().next().value} (${files.length} files)`;
  }

  return `${files.length} files selected`;
}

export function DeployForm({ baseDomain }: DeployFormProps) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [slug, setSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const selectedLabel = useMemo(
    () => (files.length > 0 ? summarizeFiles(files) : undefined),
    [files],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const slugError = validateSlug(slug);
    if (slugError) {
      toast.error(slugError);
      return;
    }

    if (files.length === 0) {
      toast.error("Add a folder or zip before deploying.");
      return;
    }

    setIsDeploying(true);

    try {
      const formData = new FormData();
      formData.set("slug", slug.trim().toLowerCase());
      formData.set("displayName", displayName.trim());
      formData.set("description", description.trim());

      for (const file of files) {
        formData.append("files", file, file.name);
      }

      const response = await fetch("/api/deploy", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as DeployResponse;
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Deployment failed.");
      }

      const params = new URLSearchParams({
        url: data.url,
        slug: data.slug ?? slug,
        displayName: data.displayName ?? displayName,
      });
      router.push(`/success?${params.toString()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Deployment failed.");
    } finally {
      setIsDeploying(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Deploy a static site</h1>
        <p className="text-muted-foreground">
          Drop HTML, CSS, and JS. Horizon publishes it to{" "}
          <span className="font-medium text-foreground">{`{slug}.${baseDomain}`}</span>.
        </p>
      </div>

      <DropZone
        onFilesSelected={setFiles}
        disabled={isDeploying}
        selectedLabel={selectedLabel}
      />

      <div className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="slug" className="text-sm font-medium">
            Project slug
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="my-demo"
              autoComplete="off"
              disabled={isDeploying}
            />
            <span className="hidden text-sm text-muted-foreground sm:inline">
              .{baseDomain}
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="displayName" className="text-sm font-medium">
            Display name
          </label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="My Demo"
            disabled={isDeploying}
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Short description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="A quick prototype for the team."
            rows={3}
            disabled={isDeploying}
          />
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isDeploying}>
        {isDeploying ? "Deploying..." : "Deploy to Vercel"}
      </Button>
    </form>
  );
}
