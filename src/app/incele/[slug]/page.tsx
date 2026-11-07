import { notFound } from "next/navigation";
import { PreviewShell } from "@/components/PreviewShell";
import { getSite, SITES } from "@/lib/sites";

export function generateStaticParams() {
  return SITES.map((s) => ({ slug: s.slug }));
}

export default async function IncelePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = getSite(slug);
  if (!site) notFound();
  return <PreviewShell site={site} />;
}
