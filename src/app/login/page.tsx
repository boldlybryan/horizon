"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/deploy";
  const session = authClient.useSession();

  useEffect(() => {
    if (session.data?.user) {
      router.replace(next);
    }
  }, [session.data?.user, next, router]);

  async function handleGoogleSignIn() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: next,
    });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Horizon</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in to deploy</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Use your Google account to publish static sites to Navistone subdomains.
        </p>
        <Button className="mt-8 w-full" size="lg" onClick={handleGoogleSignIn}>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-sm text-muted-foreground">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
