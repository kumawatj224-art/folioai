"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SeedTemplatesButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const seedTemplates = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/templates/seed", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: `${data.count} templates seeded successfully!` });
        // Reload page after 1.5s to show templates
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setResult({ success: false, message: data.error || "Failed to seed templates" });
      }
    } catch {
      setResult({ success: false, message: "Something went wrong" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={seedTemplates} disabled={isLoading}>
        {isLoading ? "Seeding..." : "Seed Sample Templates"}
      </Button>
      {result && (
        <p className={`text-sm ${result.success ? "text-green-600" : "text-red-600"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
