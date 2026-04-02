import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { getSubscription } from "@/infrastructure/repositories/subscription-repository";
import { PLAN_LIMITS, type PlanType } from "@/domain/entities/subscription";

export const metadata: Metadata = {
  title: "Pricing - FolioAI",
  description: "Choose the perfect plan for your portfolio needs",
};

export default async function PricingPage() {
  const session = await getCurrentSession();
  
  // Get current plan if logged in
  let currentPlan: PlanType = 'free';
  if (session?.user?.id) {
    const subscription = await getSubscription(session.user.id);
    currentPlan = subscription.plan;
  }
  
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#111111]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6b35]">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <span className="font-semibold tracking-tight text-[#f0ece4]">FolioAI</span>
          </Link>
          
          {session?.user ? (
            <Link 
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#a0a0a0] transition-colors hover:bg-[#1a1a1a] hover:text-[#f0ece4]"
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              href="/"
              className="rounded-lg bg-[#ff6b35] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff6b35]/90"
            >
              Get Started
            </Link>
          )}
        </div>
      </header>
      
      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Title */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#f0ece4] sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#a0a0a0]">
            Start free, upgrade when you need more. Built for Indian engineering students.
          </p>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* FREE */}
          <PricingCard
            plan="free"
            name="Free"
            description="Try before you buy"
            price={0}
            period="forever"
            features={[
              "3 portfolio generations (lifetime)",
              "2 regenerations/day",
              "3 basic templates",
              "Export HTML",
              "FolioAI branding",
            ]}
            limitations={[
              "No custom subdomain",
              "No analytics",
            ]}
            currentPlan={currentPlan}
            isLoggedIn={!!session?.user}
          />
          
          {/* STARTER */}
          <PricingCard
            plan="starter"
            name="Starter"
            description="For active job hunters"
            price={99}
            yearlyPrice={799}
            period="/month"
            features={[
              "5 generations/month",
              "10 regenerations/day",
              "All 7 templates",
              "Custom subdomain",
              "Basic analytics",
              "Unlimited resume parsing",
            ]}
            limitations={[
              "Smaller branding",
            ]}
            currentPlan={currentPlan}
            isLoggedIn={!!session?.user}
          />
          
          {/* PRO */}
          <PricingCard
            plan="pro"
            name="Pro"
            description="For serious job seekers"
            price={199}
            yearlyPrice={1499}
            period="/month"
            popular
            features={[
              "15 generations/month",
              "Unlimited regenerations",
              "All templates + Premium",
              "Custom domain (BYOD)",
              "Full analytics dashboard",
              "No FolioAI branding",
              "GitHub auto-sync",
              "Priority support",
              "Up to 3 portfolios",
            ]}
            currentPlan={currentPlan}
            isLoggedIn={!!session?.user}
          />
          
          {/* LIFETIME */}
          <PricingCard
            plan="lifetime"
            name="Lifetime"
            description="Early supporter deal"
            price={4999}
            period="one-time"
            badge="First 100 users"
            features={[
              "Everything in Pro",
              "10 generations/month",
              "Forever access",
              "Custom domain (BYOD)",
              "Early access to features",
              'Founder badge',
            ]}
            currentPlan={currentPlan}
            isLoggedIn={!!session?.user}
          />
        </div>
        
        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-bold text-[#f0ece4]">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto grid max-w-3xl gap-4">
            <FaqItem
              question="What's a generation vs regeneration?"
              answer="A generation creates a new portfolio from scratch. A regeneration edits or updates an existing portfolio. Free tier has 3 lifetime generations and 2 daily regenerations."
            />
            <FaqItem
              question="What does BYOD (Bring Your Own Domain) mean?"
              answer="You purchase a domain from any registrar (like GoDaddy, Namecheap) for ~₹500-800/year. We handle the DNS configuration and SSL certificate - no extra cost from us."
            />
            <FaqItem
              question="Can I upgrade or downgrade anytime?"
              answer="Yes! Upgrade anytime and your plan starts immediately. Downgrade at the end of your billing period."
            />
            <FaqItem
              question="Is there a student discount?"
              answer="Yes! Students with .edu.in email or GitHub Student Pack get 50% off Starter and Pro plans."
            />
            <FaqItem
              question="What happens when I reach my limit?"
              answer="You'll see a friendly modal suggesting an upgrade. You can wait for the reset (daily for regenerations, monthly for generations) or upgrade for more."
            />
          </div>
        </div>
        
        {/* CTA */}
        <div className="mt-20 text-center">
          <p className="mb-6 text-[#a0a0a0]">
            Still have questions? We're here to help.
          </p>
          <a
            href="mailto:support@folioai.in"
            className="rounded-lg border border-white/10 bg-transparent px-6 py-3 text-sm font-medium text-[#f0ece4] transition-colors hover:bg-white/5"
          >
            Contact Support
          </a>
        </div>
      </main>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type PricingCardProps = {
  plan: PlanType;
  name: string;
  description: string;
  price: number;
  yearlyPrice?: number;
  period: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  badge?: string;
  currentPlan: PlanType;
  isLoggedIn: boolean;
};

function PricingCard({
  plan,
  name,
  description,
  price,
  yearlyPrice,
  period,
  features,
  limitations,
  popular,
  badge,
  currentPlan,
  isLoggedIn,
}: PricingCardProps) {
  const isCurrentPlan = currentPlan === plan;
  const canUpgrade = getPlanRank(plan) > getPlanRank(currentPlan);
  const canDowngrade = getPlanRank(plan) < getPlanRank(currentPlan);
  
  return (
    <div className={`relative flex flex-col rounded-2xl border p-6 ${
      popular 
        ? 'border-[#ff6b35] bg-gradient-to-b from-[#ff6b35]/10 to-transparent' 
        : 'border-white/10 bg-[#111111]'
    }`}>
      {/* Popular badge */}
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#ff6b35] px-3 py-1 text-xs font-semibold text-white">
          Most Popular
        </div>
      )}
      
      {/* Limited badge */}
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-black">
          {badge}
        </div>
      )}
      
      {/* Header */}
      <div className="mb-6">
        <h3 className="mb-1 text-lg font-semibold text-[#f0ece4]">{name}</h3>
        <p className="text-sm text-[#606060]">{description}</p>
      </div>
      
      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-[#f0ece4]">
            {price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}
          </span>
          {price > 0 && (
            <span className="text-[#606060]">{period}</span>
          )}
        </div>
        {yearlyPrice && (
          <p className="mt-1 text-sm text-[#22c55e]">
            ₹{yearlyPrice.toLocaleString('en-IN')}/year (save {Math.round((1 - yearlyPrice / (price * 12)) * 100)}%)
          </p>
        )}
      </div>
      
      {/* Features */}
      <ul className="mb-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-[#a0a0a0]">
            <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22c55e]" />
            {feature}
          </li>
        ))}
        {limitations?.map((limitation) => (
          <li key={limitation} className="flex items-start gap-2 text-sm text-[#606060]">
            <XIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#606060]" />
            {limitation}
          </li>
        ))}
      </ul>
      
      {/* CTA */}
      {isCurrentPlan ? (
        <div className="rounded-xl border border-white/20 bg-white/5 py-3 text-center text-sm font-medium text-[#a0a0a0]">
          Current Plan
        </div>
      ) : canUpgrade ? (
        <button
          className={`rounded-xl py-3 text-sm font-medium transition-colors ${
            popular
              ? 'bg-[#ff6b35] text-white hover:bg-[#ff6b35]/90'
              : 'bg-white/10 text-[#f0ece4] hover:bg-white/20'
          }`}
          disabled={!isLoggedIn}
        >
          {isLoggedIn ? 'Upgrade Now' : 'Sign in to upgrade'}
        </button>
      ) : plan === 'free' ? (
        <Link
          href={isLoggedIn ? '/dashboard' : '/'}
          className="block rounded-xl bg-white/10 py-3 text-center text-sm font-medium text-[#f0ece4] transition-colors hover:bg-white/20"
        >
          {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
        </Link>
      ) : (
        <div className="rounded-xl border border-white/10 bg-transparent py-3 text-center text-sm text-[#606060]">
          {canDowngrade ? 'Contact support' : '—'}
        </div>
      )}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111111] p-5">
      <h3 className="mb-2 font-medium text-[#f0ece4]">{question}</h3>
      <p className="text-sm text-[#a0a0a0]">{answer}</p>
    </div>
  );
}

function getPlanRank(plan: PlanType): number {
  const ranks: Record<PlanType, number> = {
    free: 0,
    starter: 1,
    pro: 2,
    lifetime: 3,
  };
  return ranks[plan];
}

// Icons
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
