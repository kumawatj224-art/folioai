import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthPanel } from "@/features/auth/components/auth-panel";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { siteConfig } from "@/config/site";
import { isGoogleAuthConfigured } from "@/lib/auth/options";
import { getCurrentSession } from "@/lib/auth/session";
import { chatPortfolioRepository } from "@/infrastructure/repositories/portfolio-repository";
import { isNewAppEnabled } from "@/lib/env/feature-flags";

export default async function HomePage() {
  // Redirect to static demo page if new app is disabled
  if (!isNewAppEnabled()) {
    redirect("/index.html");
  }
  const session = await getCurrentSession();
  const googleEnabled = isGoogleAuthConfigured();
  
  // Fetch user's latest portfolio for preview (with error handling)
  let userPortfolio = null;
  if (session?.user?.id) {
    try {
      const portfolios = await chatPortfolioRepository.listSummaries(session.user.id);
      if (portfolios.length > 0) {
        const latest = await chatPortfolioRepository.findById(portfolios[0].id);
        userPortfolio = latest;
      }
    } catch (error) {
      console.error("Error fetching user portfolio:", error);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <span className="font-semibold tracking-tight text-neutral-900">
              {siteConfig.name}
            </span>
          </Link>
          
          {session?.user ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/dashboard" 
                className="px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
              >
                Dashboard
              </Link>
              <SignOutButton className="px-4 py-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900" />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-sm text-neutral-500">Have an account?</span>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
            {/* Left: Content */}
            <div className="max-w-xl">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Build in 5 minutes
              </div>

              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Create a portfolio
                <br />
                <span className="text-neutral-400">that works</span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-neutral-500">
                Simple. Professional. Free. Build a portfolio website that showcases your work and opens doors to opportunities.
              </p>

              {/* Features */}
              <div className="mt-10 flex flex-col gap-4">
                {[
                  { icon: "⚡", text: "AI-powered generation" },
                  { icon: "🎨", text: "Professional templates" },
                  { icon: "🔗", text: "Custom subdomain included" },
                ].map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3 text-sm text-neutral-600">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-base">
                      {feature.icon}
                    </span>
                    {feature.text}
                  </div>
                ))}
              </div>

              {/* CTA for non-logged in */}
              {!session?.user && (
                <div className="mt-10">
                  <p className="text-xs text-neutral-400">Trusted by 2,000+ students</p>
                </div>
              )}
            </div>

            {/* Right: Auth or Welcome */}
            {session?.user ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                    <span className="text-2xl font-semibold text-neutral-700">
                      {(session.user.name?.[0] ?? session.user.email?.[0] ?? "U").toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">Welcome back</p>
                  <h2 className="mt-1 text-xl font-semibold text-neutral-900">
                    {session.user.name ?? session.user.email}
                  </h2>
                  
                  {userPortfolio && (
                    <p className="mt-2 text-sm text-neutral-400">
                      1 portfolio created
                    </p>
                  )}

                  <div className="mt-8 space-y-3">
                    <Link 
                      href="/dashboard" 
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-900 hover:text-white hover:border-neutral-900"
                    >
                      Go to Dashboard
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <SignOutButton className="w-full rounded-xl border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-50" />
                  </div>
                </div>
              </div>
            ) : (
              <AuthPanel googleEnabled={googleEnabled} />
            )}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              {userPortfolio ? "Your Portfolio" : "Professional Design"}
            </h2>
            <p className="mt-3 text-neutral-500">
              {userPortfolio 
                ? "Here's your latest portfolio preview" 
                : "Clean, modern templates designed to impress recruiters"
              }
            </p>
          </div>

          {/* Browser Preview */}
          <div className="mx-auto mt-12 max-w-4xl">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/5">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-neutral-300" />
                  <span className="h-3 w-3 rounded-full bg-neutral-300" />
                  <span className="h-3 w-3 rounded-full bg-neutral-300" />
                </div>
                <div className="ml-4 flex-1 rounded-md bg-white px-4 py-1.5 text-xs text-neutral-400">
                  {userPortfolio 
                    ? `${session?.user?.name?.toLowerCase().replace(/\s+/g, '-') || 'your-name'}.folioai.co`
                    : 'yourname.folioai.co'
                  }
                </div>
              </div>
              
              {/* Content */}
              <div className="aspect-[16/10] bg-white">
                {userPortfolio?.htmlContent ? (
                  <iframe
                    srcDoc={userPortfolio.htmlContent}
                    className="h-full w-full pointer-events-none origin-top-left scale-[0.5]"
                    style={{ width: '200%', height: '200%' }}
                    title="Portfolio Preview"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-12">
                    <div className="w-full max-w-md space-y-6">
                      {/* Mockup Profile */}
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 rounded bg-neutral-200" />
                          <div className="h-3 w-48 rounded bg-neutral-100" />
                        </div>
                      </div>
                      {/* Mockup Projects */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-video rounded-lg bg-neutral-100" />
                        <div className="aspect-video rounded-lg bg-neutral-100" />
                      </div>
                      {/* Mockup Skills */}
                      <div className="flex gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-6 w-16 rounded-full bg-neutral-100" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-neutral-400">
            © {new Date().getFullYear()} {siteConfig.name}. Built for students.
          </p>
        </div>
      </footer>
    </main>
  );
}
