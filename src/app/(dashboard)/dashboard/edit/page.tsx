"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Card, CardHeader, CardTitle, CardDescription } from "@/components/ui";

import type { Portfolio } from "@/domain/entities/portfolio";

type FormData = {
  displayName: string;
  headline: string;
  bio: string;
  slug: string;
  email: string;
};

type SocialLink = {
  platform: string;
  url: string;
};

export default function EditPortfolioPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    headline: "",
    bio: "",
    slug: "",
    email: "",
  });
  
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res = await fetch("/api/portfolios");
        const { data } = await res.json();
        
        if (!data) {
          router.push("/dashboard/create");
          return;
        }
        
        setPortfolio(data);
        setFormData({
          displayName: data.displayName || "",
          headline: data.headline || "",
          bio: data.bio || "",
          slug: data.slug || "",
          email: data.email || "",
        });
        setSocialLinks(data.socialLinks || []);
      } catch {
        setError("Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    }
    
    fetchPortfolio();
  }, [router]);

  function updateField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  }

  function addSocialLink() {
    setSocialLinks((prev) => [...prev, { platform: "", url: "" }]);
  }

  function updateSocialLink(index: number, field: "platform" | "url", value: string) {
    setSocialLinks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function removeSocialLink(index: number) {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!portfolio) return;
    
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          socialLinks: socialLinks.filter((l) => l.platform && l.url),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save changes");
        return;
      }

      setSuccess("Portfolio updated successfully!");
      setPortfolio(data.data);
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!portfolio) return;
    
    setSaving(true);
    setError("");

    try {
      const action = portfolio.status === "published" ? "unpublish" : "publish";
      const res = await fetch(`/api/portfolios/${portfolio.id}/${action}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Failed to ${action}`);
        return;
      }

      setPortfolio(data.data);
      setSuccess(`Portfolio ${action}ed successfully!`);
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-violet-600" />
          <p className="text-neutral-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) return null;

  const socialPlatforms = [
    "GitHub",
    "LinkedIn",
    "Twitter",
    "Dribbble",
    "Behance",
    "Instagram",
    "YouTube",
    "Website",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Edit Portfolio</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Update your portfolio information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
          <Button
            variant={portfolio.status === "published" ? "ghost" : "primary"}
            onClick={handlePublish}
            disabled={saving}
          >
            {portfolio.status === "published" ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your public profile details</CardDescription>
          </CardHeader>
          <div className="space-y-4 px-6 pb-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Display Name *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Headline
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => updateField("headline", e.target.value)}
                placeholder="e.g., Full Stack Developer"
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                rows={4}
                placeholder="Tell visitors about yourself..."
                className="w-full resize-none rounded-lg border border-neutral-300 px-4 py-2.5 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>
        </Card>

        {/* URL Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio URL</CardTitle>
            <CardDescription>Your public portfolio address</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">folioai.com/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 font-mono text-sm transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Only lowercase letters, numbers, and hyphens
            </p>
          </div>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Connect your online presence</CardDescription>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addSocialLink}
            >
              Add Link
            </Button>
          </CardHeader>
          <div className="space-y-3 px-6 pb-6">
            {socialLinks.length === 0 && (
              <p className="py-4 text-center text-sm text-neutral-500">
                No social links added yet
              </p>
            )}
            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-3">
                <select
                  value={link.platform}
                  onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                  className="w-32 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">Platform</option>
                  {socialPlatforms.map((p) => (
                    <option key={p} value={p.toLowerCase()}>
                      {p}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                  placeholder="https://"
                  className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="p-2 text-neutral-400 transition-colors hover:text-red-500"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
