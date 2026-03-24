import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentSession } from "@/lib/auth/session";
import { templateRepository } from "@/infrastructure/repositories/template-repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeedTemplatesButton } from "@/components/templates/seed-templates-button";

export const metadata = {
  title: "Choose a Template | FolioAI",
  description: "Browse and select from our professionally designed portfolio templates",
};

export default async function TemplatesPage() {
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect("/");
  }

  const templates = await templateRepository.listAll();

  const freeTemplates = templates.filter(t => t.isFree);
  const paidTemplates = templates.filter(t => !t.isFree);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-neutral-500 hover:text-neutral-900">
              ← Back to Dashboard
            </Link>
            <span className="text-neutral-300">|</span>
            <h1 className="font-semibold text-neutral-900">Choose a Template</h1>
          </div>
          <span className="text-sm text-neutral-500">{session.user.email}</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Pick Your Perfect Template
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-neutral-600">
            Choose from our professionally designed templates. Fill in your details and get a stunning portfolio in minutes.
          </p>
        </div>

        {/* Free Templates */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <h3 className="text-xl font-semibold text-neutral-900">Free Templates</h3>
            <Badge variant="success">Free</Badge>
          </div>
          
          {freeTemplates.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {freeTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No free templates available. Seed the database first.</p>
          )}
        </section>

        {/* Premium Templates */}
        {paidTemplates.length > 0 && (
          <section>
            <div className="mb-6 flex items-center gap-3">
              <h3 className="text-xl font-semibold text-neutral-900">Premium Templates</h3>
              <Badge variant="default">Pro</Badge>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paidTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {templates.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">No Templates Yet</h3>
            <p className="mb-4 text-neutral-600">
              Templates need to be seeded into the database first.
            </p>
            <SeedTemplatesButton />
          </div>
        )}
      </main>
    </div>
  );
}

function TemplateCard({ template }: { template: { id: string; name: string; slug: string; description: string | null; category: string; isFree: boolean; priceInr: number } }) {
  const categoryColors: Record<string, string> = {
    minimal: "bg-neutral-100 text-neutral-700",
    professional: "bg-blue-100 text-blue-700",
    creative: "bg-purple-100 text-purple-700",
    developer: "bg-green-100 text-green-700",
    general: "bg-neutral-100 text-neutral-700",
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:shadow-lg">
      {/* Preview area */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-neutral-100 to-neutral-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-neutral-300">{template.name.charAt(0)}</div>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryColors[template.category] || categoryColors.general}`}>
              {template.category}
            </span>
          </div>
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
          <Link href={`/templates/${template.slug}/preview`}>
            <Button variant="secondary" size="sm">
              Preview
            </Button>
          </Link>
        </div>

        {/* Price badge */}
        {!template.isFree && (
          <div className="absolute right-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
            ₹{template.priceInr}
          </div>
        )}
        {template.isFree && (
          <div className="absolute right-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
            FREE
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-semibold text-neutral-900">{template.name}</h4>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
          {template.description}
        </p>
        
        <div className="mt-4 flex gap-2">
          <Link href={`/templates/${template.slug}/create`} className="flex-1">
            <Button className="w-full" disabled={!template.isFree}>
              {template.isFree ? "Use Template" : "Unlock (Coming Soon)"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
