import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { getCurrentSession } from "@/lib/auth/session";
import { templateRepository } from "@/infrastructure/repositories/template-repository";
import { renderTemplate } from "@/infrastructure/services/template-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Params = {
  params: Promise<{ slug: string }>;
};

export default async function TemplatePreviewPage({ params }: Params) {
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect("/");
  }

  const { slug } = await params;
  const template = await templateRepository.findBySlug(slug);

  if (!template) {
    notFound();
  }

  // Sample data for preview
  const sampleData = {
    name: "Alex Kumar",
    tagline: "Full-Stack Developer & Open Source Enthusiast",
    email: "alex@example.com",
    about: "Passionate software developer with a love for clean code and innovative solutions. Currently pursuing B.Tech in Computer Science, I specialize in building scalable web applications and contributing to open source projects.",
    college: "Indian Institute of Technology, Delhi",
    branch: "Computer Science & Engineering",
    graduationYear: "2026",
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "PostgreSQL", "Docker", "AWS"],
    projects: [
      {
        title: "TaskFlow Pro",
        description: "A real-time collaborative task management app with drag-and-drop interface, team workspaces, and Kanban boards.",
        techStack: ["React", "Node.js", "Socket.io", "MongoDB"],
        liveUrl: "https://taskflow.demo.com",
        githubUrl: "https://github.com/alex/taskflow",
      },
      {
        title: "AI Code Review Bot",
        description: "GitHub bot that automatically reviews pull requests using GPT-4, suggesting improvements and catching bugs.",
        techStack: ["Python", "OpenAI API", "GitHub Actions"],
        githubUrl: "https://github.com/alex/code-review-bot",
      },
    ],
    experience: [
      {
        company: "Google Summer of Code",
        role: "Open Source Contributor",
        duration: "May - Aug 2025",
        description: "Contributed to TensorFlow documentation and examples",
      },
      {
        company: "Startup XYZ",
        role: "Frontend Intern",
        duration: "Jan - Apr 2025",
        description: "Built dashboard components with React and TypeScript",
      },
    ],
    socialLinks: {
      github: "https://github.com/alexkumar",
      linkedin: "https://linkedin.com/in/alexkumar",
      twitter: "https://twitter.com/alexkumar",
    },
  };

  const previewHtml = renderTemplate(template.htmlTemplate, template.slug, sampleData);

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/[0.08] bg-[#111111] px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/templates" className="text-[#a0a0a0] transition-colors hover:text-[#f0ece4]">
            ← Templates
          </Link>
          <span className="text-[#606060]">|</span>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-semibold text-[#f0ece4]">{template.name}</h1>
            {template.isFree ? (
              <Badge variant="success">Free</Badge>
            ) : (
              <Badge variant="default">₹{template.priceInr}</Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href={`/templates/${template.slug}/create`}>
            <Button disabled={!template.isFree}>
              {template.isFree ? "Use This Template" : "Unlock (Coming Soon)"}
            </Button>
          </Link>
        </div>
      </header>

      {/* Info Bar */}
      <div className="border-b border-white/[0.08] bg-[#1a1a1a] px-6 py-2">
        <p className="text-center text-sm text-[#a0a0a0]">
          <span className="font-medium text-[#f0ece4]">Preview Mode</span> — This is how your portfolio will look with sample data
        </p>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 overflow-auto bg-[#0a0a0a] p-4">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-white/[0.08] bg-white shadow-2xl shadow-black/50">
          <iframe
            srcDoc={previewHtml}
            className="h-[800px] w-full"
            title="Template Preview"
          />
        </div>
      </div>
    </div>
  );
}
