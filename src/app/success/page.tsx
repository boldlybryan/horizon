"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { SuccessPanel } from "@/components/success-panel";

function SuccessContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const slug = searchParams.get("slug");
  const displayName = searchParams.get("displayName");

  if (!url || !slug || !displayName) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Missing deployment details.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-10">
      <SuccessPanel url={url} slug={slug} displayName={displayName} />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-sm text-muted-foreground">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
