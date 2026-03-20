import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { createRepositories } from "@/infrastructure/repositories/file-repository";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { portfolios } = createRepositories();
  const portfolio = await portfolios.findBySlug(slug);

  if (!portfolio) {
    return { title: "Portfolio Not Found | FolioAI" };
  }

  return {
    title: `${portfolio.displayName} | FolioAI`,
    description: portfolio.headline || `${portfolio.displayName}'s portfolio`,
    openGraph: {
      title: portfolio.displayName,
      description: portfolio.headline || portfolio.bio?.substring(0, 160),
      type: "profile",
      images: portfolio.avatarUrl ? [portfolio.avatarUrl] : [],
    },
  };
}

export default async function PortfolioPage({ params }: PageProps) {
  const { slug } = await params;
  const { portfolios, projects, skills } = createRepositories();
  
  const portfolio = await portfolios.findBySlug(slug);

  if (!portfolio) {
    notFound();
  }

  const portfolioProjects = await projects.findByPortfolioId(portfolio.id);
  const portfolioSkills = await skills.findByPortfolioId(portfolio.id);

  // Group skills by category
  const skillsByCategory = portfolioSkills.reduce(
    (acc, skill) => {
      const category = skill.category || "other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, typeof portfolioSkills>,
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="border-b border-neutral-100 bg-gradient-to-br from-neutral-50 to-white">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
          <div className="text-center">
            {portfolio.avatarUrl && (
              <img
                src={portfolio.avatarUrl}
                alt={portfolio.displayName}
                className="mx-auto mb-6 h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-lg"
              />
            )}
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
              {portfolio.displayName}
            </h1>
            {portfolio.headline && (
              <p className="mt-4 text-xl text-neutral-600">{portfolio.headline}</p>
            )}
            {portfolio.bio && (
              <p className="mx-auto mt-6 max-w-2xl text-neutral-500 leading-relaxed">
                {portfolio.bio}
              </p>
            )}

            {/* Social Links */}
            {portfolio.socialLinks && portfolio.socialLinks.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {portfolio.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
                  >
                    <SocialIcon platform={link.platform} />
                    {link.platform}
                  </a>
                ))}
              </div>
            )}

            {/* Contact */}
            {portfolio.email && (
              <a
                href={`mailto:${portfolio.email}`}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 font-medium text-white transition-colors hover:bg-violet-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Me
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        {/* Skills Section */}
        {portfolioSkills.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-8 text-2xl font-semibold text-neutral-900">Skills</h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category}>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">
                    {formatCategory(category)}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700"
                      >
                        {skill.name}
                        {skill.level && (
                          <span className="ml-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getLevelColor(skill.level) }} />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {portfolioProjects.length > 0 && (
          <section>
            <h2 className="mb-8 text-2xl font-semibold text-neutral-900">Projects</h2>
            <div className="grid gap-8">
              {portfolioProjects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-neutral-900">{project.title}</h3>
                      {project.description && (
                        <p className="mt-2 text-neutral-600">{project.description}</p>
                      )}
                      
                      {/* Tech Stack */}
                      {project.techStack && project.techStack.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {project.techStack.map((tech) => (
                            <span
                              key={tech.name}
                              className="rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700"
                            >
                              {tech.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Links */}
                      <div className="mt-4 flex gap-4">
                        {project.links?.filter((l) => l.type === "live" || l.type === "demo").map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {link.label || "Live Demo"}
                          </a>
                        ))}
                        {project.links?.filter((l) => l.type === "github").map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            {link.label || "Source Code"}
                          </a>
                        ))}
                      </div>
                    </div>

                    {project.thumbnailUrl && (
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="h-32 w-48 flex-shrink-0 rounded-lg object-cover"
                      />
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {portfolioProjects.length === 0 && portfolioSkills.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-neutral-500">This portfolio is still being built.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8">
        <div className="mx-auto max-w-4xl px-6 text-center text-sm text-neutral-500">
          Built with{" "}
          <a href="/" className="font-medium text-violet-600 hover:text-violet-700">
            FolioAI
          </a>
        </div>
      </footer>
    </div>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  const iconClass = "h-4 w-4";
  
  switch (platform.toLowerCase()) {
    case "github":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "twitter":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
  }
}

function formatCategory(category: string): string {
  return category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getLevelColor(level: string): string {
  switch (level) {
    case "expert":
      return "#7c3aed";
    case "advanced":
      return "#8b5cf6";
    case "intermediate":
      return "#a78bfa";
    case "beginner":
      return "#c4b5fd";
    default:
      return "#d1d5db";
  }
}
