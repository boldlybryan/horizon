"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const navItems = [
  { href: "/deploy", label: "Deploy" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  const router = useRouter();
  const session = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/deploy" className="text-sm font-semibold tracking-tight">
            Horizon
          </Link>
          <nav className="hidden items-center gap-4 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {session.data?.user ? (
            <>
              <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:inline">
                {session.data.user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
