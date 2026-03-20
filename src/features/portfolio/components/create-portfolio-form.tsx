"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { Card } from "@/components/ui/card";

type CreatePortfolioFormProps = {
  userId: string;
  userName: string;
};

type FormData = {
  displayName: string;
  headline: string;
  bio: string;
  slug: string;
};

export function CreatePortfolioForm({ userId, userName }: CreatePortfolioFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    displayName: userName,
    headline: "",
    bio: "",
    slug: userName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
  });

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    
    // Auto-update slug when displayName changes
    if (field === "displayName") {
      const newSlug = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      setFormData((prev) => ({ ...prev, slug: newSlug }));
      setSlugAvailable(null);
    }
    
    if (field === "slug") {
      setSlugAvailable(null);
    }
  }, []);

  const checkSlugAvailability = useCallback(async () => {
    if (!formData.slug || formData.slug.length < 3) return;
    
    try {
      const response = await fetch(`/api/portfolios/check-slug?slug=${encodeURIComponent(formData.slug)}`);
      const data = await response.json() as { available: boolean };
      setSlugAvailable(data.available);
    } catch {
      // Silently fail
    }
  }, [formData.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          displayName: formData.displayName,
          headline: formData.headline,
          bio: formData.bio,
          slug: formData.slug,
        }),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error ?? "Failed to create portfolio");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display Name */}
        <FormInput
          id="displayName"
          label="Your Name"
          type="text"
          value={formData.displayName}
          onChange={(e) => updateField("displayName", e.target.value)}
          placeholder="Arjun Sharma"
          required
        />

        {/* Headline */}
        <FormInput
          id="headline"
          label="Headline"
          type="text"
          value={formData.headline}
          onChange={(e) => updateField("headline", e.target.value)}
          placeholder="CSE Final Year · VIT Vellore"
        />

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">
            Short Bio
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--foreground)] focus:bg-white min-h-[100px] resize-none"
            placeholder="A passionate developer focused on building products that make a difference..."
          />
        </div>

        {/* Slug / URL */}
        <div>
          <label htmlFor="slug" className="mb-1.5 block text-sm font-medium">
            Your Portfolio URL
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--muted)]">folioai.co/</span>
            <input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              onBlur={checkSlugAvailability}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--foreground)] focus:bg-white"
              placeholder="arjun-sharma"
              pattern="[a-z0-9-]+"
              minLength={3}
              maxLength={50}
              required
            />
          </div>
          {slugAvailable !== null && (
            <p className={`mt-1.5 text-xs ${slugAvailable ? "text-green-600" : "text-red-600"}`}>
              {slugAvailable ? "✓ This URL is available" : "✗ This URL is already taken"}
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isPending}
            disabled={!formData.displayName || !formData.slug}
          >
            Create Portfolio
          </Button>
        </div>
      </form>
    </Card>
  );
}
