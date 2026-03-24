import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { TemplateCreateForm } from "@/features/portfolio/components/template-create-form";
import { templateRepository } from "@/infrastructure/repositories/template-repository";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function TemplateCreatePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/");
  }

  const resolvedParams = await params;
  const template = await templateRepository.findBySlug(resolvedParams.slug);

  if (!template) {
    redirect("/templates");
  }

  // Check if template is paid and user hasn't purchased
  // For MVP1, we'll allow all templates (paid check can be added later)
  if (!template.isFree) {
    // TODO: Check payment status
    // For now, show a message or redirect
  }

  return (
    <div className="h-full w-full px-6 py-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-900">Create Your Portfolio</h1>
        <p className="text-sm text-neutral-600">Fill in your details and we&apos;ll generate a beautiful portfolio for you.</p>
      </div>
      
      <TemplateCreateForm
        templateSlug={template.slug}
        templateName={template.name}
        userId={session.user.id}
        userName={session.user.name || ""}
      />
    </div>
  );
}
