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
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.08] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6b35]">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <span className="font-display text-base font-semibold tracking-tight text-[#f0ece4]">
              {siteConfig.name}
            </span>
          </Link>
          
          {session?.user ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/dashboard" 
                className="flex h-10 items-center px-4 text-sm font-medium text-[#a0a0a0] transition-colors hover:text-[#f0ece4]"
              >
                Dashboard
              </Link>
              <SignOutButton className="flex h-10 items-center px-4 text-sm font-medium text-[#a0a0a0] transition-colors hover:text-[#f0ece4]" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a 
                href="#auth" 
                className="inline-flex h-10 items-center justify-center rounded-full border border-white/[0.15] px-5 text-sm font-medium text-[#a0a0a0] transition-all hover:border-[#ff6b35] hover:text-[#f0ece4]"
              >
                Sign in
              </a>
              <a 
                href="#auth" 
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#ff6b35] px-5 text-sm font-semibold text-white transition-all hover:opacity-90"
              >
                Get started free
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
        {/* Glow Effect */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,107,53,0.12)_0%,transparent_70%)]" />
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Pill Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/[0.08] px-4 py-1.5 text-sm text-[#ff6b35]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff6b35]" />
            Built for Indian placement season 2026
          </div>

          {/* Heading */}
          <h1 className="font-display text-5xl font-bold leading-[1.0] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-[#f0ece4]">Build your portfolio</span>
            <br />
            <span className="text-[#ff6b35]">in 60 seconds.</span>
            <br />
            <span className="font-normal text-[#606060]">Get placed faster.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-lg font-light leading-relaxed text-[#a0a0a0]">
            Chat with AI, get a stunning portfolio, deploy it live — before your next interview. No coding. No design skills needed.
          </p>

          {/* CTA */}
          {session?.user ? (
            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="rounded-2xl border border-white/[0.15] bg-[#111111] p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1a1a] mx-auto mb-4">
                  <span className="text-xl font-semibold text-[#f0ece4]">
                    {(session.user.name?.[0] ?? session.user.email?.[0] ?? "U").toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-[#606060]">Welcome back</p>
                <h2 className="mt-1 text-lg font-semibold text-[#f0ece4]">
                  {session.user.name ?? session.user.email}
                </h2>
                {userPortfolio && (
                  <p className="mt-2 text-sm text-[#606060]">1 portfolio created</p>
                )}
                <div className="mt-6 flex flex-col gap-3">
                  <Link 
                    href="/dashboard" 
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.15] bg-[#1a1a1a] px-6 py-3 text-sm font-medium text-[#f0ece4] transition-all hover:bg-[#ff6b35] hover:border-[#ff6b35]"
                  >
                    Go to Dashboard
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <SignOutButton className="w-full rounded-xl border border-white/[0.08] px-6 py-3 text-sm font-medium text-[#a0a0a0] transition-all hover:bg-[#1a1a1a] hover:text-[#f0ece4]" />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="flex max-w-md w-full gap-0 overflow-hidden rounded-2xl border border-white/[0.15] bg-[#111111] p-1.5">
                <input
                  type="email"
                  placeholder="your.email@college.edu"
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-[#f0ece4] placeholder-[#606060] outline-none"
                />
                <button className="whitespace-nowrap rounded-xl bg-[#ff6b35] px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90">
                  Join waitlist →
                </button>
              </div>
              <p className="text-xs text-[#606060]">
                Free during beta · No credit card · First 500 get Pro free
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 border-t border-white/[0.08] pt-12">
            {[
              { num: "1.5M+", label: "engineering grads/year" },
              { num: "<3%", label: "have a portfolio" },
              { num: "60s", label: "to build yours" },
              { num: "₹0", label: "to get started" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-bold text-[#f0ece4]">{stat.num}</div>
                <div className="text-sm text-[#606060]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-white/[0.08] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-[#ff6b35]">
              Features
            </span>
            <h2 className="font-display text-3xl font-bold text-[#f0ece4] sm:text-4xl">
              Everything you need to stand out
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { 
                icon: "💬", 
                iconBg: "bg-[#ff6b35]/15",
                title: "AI Chat Interface", 
                desc: "Just describe yourself — projects, skills, internships. The AI asks the right questions and builds your portfolio as you chat." 
              },
              { 
                icon: "🚀", 
                iconBg: "bg-[#3b82f6]/15",
                title: "One-Click Deploy", 
                desc: "Portfolio goes live on jai.getfolioai.in instantly. Share the link in your resume and impress recruiters." 
              },
              { 
                icon: "🎨", 
                iconBg: "bg-[#22c55e]/15",
                title: "Free Templates", 
                desc: "3 free templates designed for placement season — minimal dark, professional light, and colorful. All genuinely good." 
              },
              { 
                icon: "📊", 
                iconBg: "bg-[#a855f7]/15",
                title: "Portfolio Manager", 
                desc: "Create multiple portfolios for different roles. Edit via chat anytime. Track who viewed your portfolio." 
              },
            ].map((feature) => (
              <div 
                key={feature.title} 
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111] p-7 transition-all hover:-translate-y-1 hover:border-white/[0.15]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,107,53,0.05)_0%,transparent_60%)]" />
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg} text-2xl`}>
                  {feature.icon}
                </div>
                <h3 className="font-display mb-2 text-lg font-semibold text-[#f0ece4]">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[#a0a0a0]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="border-t border-white/[0.08] bg-[#111111] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-[#f0ece4] sm:text-3xl">
              {userPortfolio ? "Your Portfolio" : "Professional Design"}
            </h2>
            <p className="mt-3 text-[#a0a0a0]">
              {userPortfolio 
                ? "Here's your latest portfolio preview" 
                : "Clean, modern templates designed to impress recruiters"
              }
            </p>
          </div>

          {/* Browser Preview */}
          <div className="mx-auto mt-12 max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a] shadow-2xl">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.08] bg-[#111111] px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#606060]" />
                  <span className="h-3 w-3 rounded-full bg-[#606060]" />
                  <span className="h-3 w-3 rounded-full bg-[#606060]" />
                </div>
                <div className="ml-4 flex-1 rounded-lg bg-[#1a1a1a] px-4 py-1.5 text-xs text-[#606060]">
                  {userPortfolio 
                    ? `${session?.user?.name?.toLowerCase().replace(/\s+/g, '-') || 'your-name'}.folioai.co`
                    : 'yourname.folioai.co'
                  }
                </div>
              </div>
              
              {/* Content */}
              <div className="aspect-[16/10]">
                {userPortfolio?.htmlContent ? (
                  <iframe
                    srcDoc={userPortfolio.htmlContent}
                    className="h-full w-full pointer-events-none origin-top-left scale-[0.5]"
                    style={{ width: '200%', height: '200%' }}
                    title="Portfolio Preview"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-12">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,107,53,0.2)_0%,transparent_60%)]" />
                    <h3 className="relative font-display text-4xl font-bold text-white sm:text-5xl">
                      Your Name
                    </h3>
                    <p className="relative mt-2 text-white/60">Full Stack Developer · Your College</p>
                    <div className="relative mt-6 flex flex-wrap justify-center gap-2">
                      <span className="rounded-full bg-[#ff6b35] px-4 py-1.5 text-xs font-medium text-white">React</span>
                      <span className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-white/70">Node.js</span>
                      <span className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-white/70">Python</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      {!session?.user && (
        <section id="auth" className="border-t border-white/[0.08] py-20">
          <div className="mx-auto max-w-md px-6">
            <div className="mb-8 text-center">
              <h2 className="font-display text-2xl font-bold text-[#f0ece4] sm:text-3xl">
                Get Started
              </h2>
              <p className="mt-2 text-[#a0a0a0]">
                Create your portfolio in 60 seconds
              </p>
            </div>
            <AuthPanel googleEnabled={googleEnabled} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-[#606060]" suppressHydrationWarning>
            © {new Date().getFullYear()} {siteConfig.name}. Built for students.
          </p>
        </div>
      </footer>
    </main>
  );
}
