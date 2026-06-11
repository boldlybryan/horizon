import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth, toSessionUser } from "@/lib/auth";
import { normalizeUpload } from "@/lib/files/normalize-upload";
import { normalizeSlug, validateSlug } from "@/lib/slug";
import { assignDeploymentAlias } from "@/lib/vercel/assign-alias";
import { VercelApiError } from "@/lib/vercel/client";
import { createDeployment } from "@/lib/vercel/create-deployment";
import {
  prepareUploadFiles,
  toFileReferences,
  uploadFilesToVercel,
} from "@/lib/vercel/upload-files";
import { waitForDeploymentReady } from "@/lib/vercel/wait-for-ready";

export const maxDuration = 300;

const deploySchema = z.object({
  slug: z.string().min(1),
  displayName: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
});

function mapVercelError(error: VercelApiError): string {
  if (error.status === 409) {
    return "That subdomain is already in use. Choose a different slug.";
  }
  if (error.status === 403) {
    return "Vercel rejected this deployment. Check your token and domain permissions.";
  }
  if (error.status === 404) {
    return "The deployment domain was not found in Vercel.";
  }
  return error.message;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const parsed = deploySchema.safeParse({
      slug: formData.get("slug"),
      displayName: formData.get("displayName"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid deployment details.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const slug = normalizeSlug(parsed.data.slug);
    const slugError = validateSlug(slug);
    if (slugError) {
      return NextResponse.json({ error: slugError }, { status: 400 });
    }

    const normalizedFiles = await normalizeUpload(formData);
    const uploadFiles = prepareUploadFiles(normalizedFiles);
    await uploadFilesToVercel(uploadFiles);

    const user = toSessionUser(session.user);
    const deployment = await createDeployment({
      slug,
      files: toFileReferences(uploadFiles),
      meta: {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        slug,
        displayName: parsed.data.displayName,
        description: parsed.data.description,
      },
    });

    await waitForDeploymentReady(deployment.id);
    const alias = await assignDeploymentAlias(deployment.id, slug);

    return NextResponse.json({
      ok: true,
      url: alias.url,
      deploymentId: deployment.id,
      slug,
      displayName: parsed.data.displayName,
    });
  } catch (error) {
    if (error instanceof VercelApiError) {
      return NextResponse.json({ error: mapVercelError(error) }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Deployment failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
