import { DashboardList } from "@/components/dashboard-list";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Deployments</h1>
        <p className="text-muted-foreground">
          Previous Horizon publishes pulled from Vercel deployment metadata.
        </p>
      </div>
      <DashboardList />
    </div>
  );
}
