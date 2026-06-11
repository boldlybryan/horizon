import { DeployForm } from "@/components/deploy-form";

export default function DeployPage() {
  const baseDomain = process.env.HORIZON_BASE_DOMAIN || "navistone.dev";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <DeployForm baseDomain={baseDomain} />
    </div>
  );
}
