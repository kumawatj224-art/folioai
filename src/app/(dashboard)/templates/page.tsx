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
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-white/[0.08] bg-[#111111] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#a0a0a0] transition-colors hover:text-[#f0ece4]">
              ← Back to Dashboard
            </Link>
            <span className="text-[#606060]">|</span>
            <h1 className="font-display font-semibold text-[#f0ece4]">Choose a Template</h1>
          </div>
          <span className="text-sm text-[#a0a0a0]">{session.user.email}</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#f0ece4] md:text-4xl">
            Pick Your Perfect Template
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[#a0a0a0]">
            Choose from our professionally designed templates. Fill in your details and get a stunning portfolio in minutes.
          </p>
        </div>

        {/* Free Templates */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <h3 className="text-xl font-semibold text-[#f0ece4]">Free Templates</h3>
            <Badge variant="success">Free</Badge>
          </div>
          
          {freeTemplates.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {freeTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <p className="text-[#606060]">No free templates available. Seed the database first.</p>
          )}
        </section>

        {/* Premium Templates */}
        {paidTemplates.length > 0 && (
          <section>
            <div className="mb-6 flex items-center gap-3">
              <h3 className="text-xl font-semibold text-[#f0ece4]">Premium Templates</h3>
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
          <div className="rounded-2xl border-2 border-dashed border-white/[0.15] bg-[#111111] p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1a1a]">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#f0ece4]">No Templates Yet</h3>
            <p className="mb-4 text-[#a0a0a0]">
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
    minimal: "bg-white/[0.08] text-[#a0a0a0]",
    professional: "bg-blue-500/20 text-blue-400",
    creative: "bg-purple-500/20 text-purple-400",
    developer: "bg-green-500/20 text-green-400",
    general: "bg-white/[0.08] text-[#a0a0a0]",
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111] transition hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/20">
      {/* Preview area */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#1a1a1a] to-[#111111]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-[#606060]">{template.name.charAt(0)}</div>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryColors[template.category] || categoryColors.general}`}>
              {template.category}
            </span>
          </div>
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
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
          <div className="absolute right-3 top-3 rounded-full bg-[#22c55e] px-3 py-1 text-xs font-bold text-white">
            FREE
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-semibold text-[#f0ece4]">{template.name}</h4>
        <p className="mt-1 line-clamp-2 text-sm text-[#a0a0a0]">
          {template.description}
        </p>
        
        <div className="mt-4 flex gap-2">
          <Link href={`/chat/new?template=${template.slug}`} className="flex-1">
            <Button className="w-full" disabled={!template.isFree}>
              {template.isFree ? "Use Template" : "Unlock (Coming Soon)"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
