import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { VercelApiError } from "@/lib/vercel/client";
import { listHorizonDeployments } from "@/lib/vercel/list-deployments";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 100;
    const deployments = await listHorizonDeployments(Number.isFinite(limit) ? limit : 100);

    return NextResponse.json({ deployments });
  } catch (error) {
    if (error instanceof VercelApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Failed to load deployments.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
