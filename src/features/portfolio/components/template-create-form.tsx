"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import type { StudentData } from "@/domain/entities/template";

type TemplateCreateFormProps = {
  templateSlug: string;
  templateName: string;
  userId: string;
  userName: string;
};

export function TemplateCreateForm({ 
  templateSlug, 
  templateName, 
  userId, 
  userName 
}: TemplateCreateFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const [formData, setFormData] = useState<StudentData>({
    name: userName || "",
    tagline: "",
    email: "",
    about: "",
    college: "",
    branch: "",
    graduationYear: "",
    skills: [],
    projects: [],
    experience: [],
    socialLinks: {},
  });

  const [skillInput, setSkillInput] = useState("");

  const updateField = <K extends keyof StudentData>(field: K, value: StudentData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      updateField("skills", [...(formData.skills || []), skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    updateField("skills", formData.skills?.filter(s => s !== skill) || []);
  };

  const addProject = () => {
    updateField("projects", [
      ...(formData.projects || []),
      { title: "", description: "", techStack: [] },
    ]);
  };

  const updateProject = (index: number, field: string, value: string | string[]) => {
    const projects = [...(formData.projects || [])];
    projects[index] = { ...projects[index], [field]: value };
    updateField("projects", projects);
  };

  const removeProject = (index: number) => {
    const projects = [...(formData.projects || [])];
    projects.splice(index, 1);
    updateField("projects", projects);
  };

  const generatePreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/${templateSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate preview");
      }

      setPreviewHtml(result.html);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const savePortfolio = async () => {
    if (!previewHtml) return;

    setIsLoading(true);
    setError(null);

    try {
      const title = formData.name 
        ? `${formData.name}'s Portfolio`
        : "My Portfolio";

      const response = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          htmlContent: previewHtml,
          chatHistory: [], // No chat history for template-based portfolios
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save portfolio");
      }

      router.push(`/portfolio/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-6">
      {/* Form Panel */}
      <div className="w-1/2 overflow-auto rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
        <div className="mb-6">
          <p className="text-sm text-[#a0a0a0]">Using template: <span className="font-medium text-[#ff6b35]">{templateName}</span></p>
          <h2 className="mt-1 font-display text-xl font-bold text-[#f0ece4]">
            {step === 1 && "Basic Information"}
            {step === 2 && "Skills & Projects"}
            {step === 3 && "Review & Save"}
          </h2>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${
                  s <= step ? "bg-[#ff6b35]" : "bg-white/[0.08]"
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <FormInput
              id="name"
              label="Full Name"
              value={formData.name}
              onChange={e => updateField("name", e.target.value)}
              placeholder="Rahul Sharma"
              required
            />
            <FormInput
              id="tagline"
              label="Tagline / Title"
              value={formData.tagline || ""}
              onChange={e => updateField("tagline", e.target.value)}
              placeholder="Full-Stack Developer | Open Source Enthusiast"
            />
            <FormInput
              id="email"
              label="Email"
              type="email"
              value={formData.email || ""}
              onChange={e => updateField("email", e.target.value)}
              placeholder="rahul@example.com"
            />
            <FormInput
              id="college"
              label="College / University"
              value={formData.college || ""}
              onChange={e => updateField("college", e.target.value)}
              placeholder="IIT Delhi"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                id="branch"
                label="Branch / Major"
                value={formData.branch || ""}
                onChange={e => updateField("branch", e.target.value)}
                placeholder="Computer Science"
              />
              <FormInput
                id="graduationYear"
                label="Graduation Year"
                value={formData.graduationYear || ""}
                onChange={e => updateField("graduationYear", e.target.value)}
                placeholder="2026"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#a0a0a0]">About You</label>
              <textarea
                value={formData.about || ""}
                onChange={e => updateField("about", e.target.value)}
                placeholder="Write a brief introduction about yourself..."
                rows={4}
                className="w-full rounded-xl border border-white/[0.08] bg-[#1a1a1a] px-4 py-3 text-sm text-[#f0ece4] placeholder-[#606060] focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)}>
                Next: Skills & Projects →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Skills & Projects */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Skills */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#a0a0a0]">Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill (press Enter)"
                  className="flex-1 rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-3 py-2 text-sm text-[#f0ece4] placeholder-[#606060] focus:border-[#ff6b35] focus:outline-none"
                />
                <Button variant="secondary" onClick={addSkill}>Add</Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.skills?.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-[#ff6b35]/20 px-3 py-1 text-sm text-[#ff6b35]"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-[#ff8c5a]">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-[#a0a0a0]">Projects</label>
                <Button variant="secondary" size="sm" onClick={addProject}>+ Add Project</Button>
              </div>
              
              {formData.projects?.map((project, idx) => (
                <div key={idx} className="mb-4 rounded-lg border border-white/[0.08] bg-[#1a1a1a] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#a0a0a0]">Project {idx + 1}</span>
                    <button
                      onClick={() => removeProject(idx)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={project.title}
                      onChange={e => updateProject(idx, "title", e.target.value)}
                      placeholder="Project Title"
                      className="w-full rounded-lg border border-white/[0.08] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f0ece4] placeholder-[#606060] focus:border-[#ff6b35] focus:outline-none"
                    />
                    <textarea
                      value={project.description}
                      onChange={e => updateProject(idx, "description", e.target.value)}
                      placeholder="Brief description..."
                      rows={2}
                      className="w-full rounded-lg border border-white/[0.08] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f0ece4] placeholder-[#606060] focus:border-[#ff6b35] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={project.techStack?.join(", ") || ""}
                      onChange={e => updateProject(idx, "techStack", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                      placeholder="Tech stack (comma separated): React, Node.js, MongoDB"
                      className="w-full rounded-lg border border-white/[0.08] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f0ece4] placeholder-[#606060] focus:border-[#ff6b35] focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="url"
                        value={project.liveUrl || ""}
                        onChange={e => updateProject(idx, "liveUrl", e.target.value)}
                        placeholder="Live URL (optional)"
                        className="w-full rounded-lg border border-white/[0.08] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f0ece4] placeholder-[#606060] focus:border-[#ff6b35] focus:outline-none"
                      />
                      <input
                        type="url"
                        value={project.githubUrl || ""}
                        onChange={e => updateProject(idx, "githubUrl", e.target.value)}
                        placeholder="GitHub URL (optional)"
                        className="w-full rounded-lg border border-white/[0.08] bg-[#0a0a0a] px-3 py-2 text-sm text-[#f0ece4] placeholder-[#606060] focus:border-[#ff6b35] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#a0a0a0]">Social Links</label>
              <div className="space-y-3">
                <input
                  type="url"
                  value={formData.socialLinks?.github || ""}
                  onChange={e => updateField("socialLinks", { ...formData.socialLinks, github: e.target.value })}
                  placeholder="GitHub URL"
                  className="w-full rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-3 py-2 text-sm text-[#f0ece4] placeholder-[#606060] focus:border-[#ff6b35] focus:outline-none"
                />
                <input
                  type="url"
                  value={formData.socialLinks?.linkedin || ""}
                  onChange={e => updateField("socialLinks", { ...formData.socialLinks, linkedin: e.target.value })}
                  placeholder="LinkedIn URL"
                  className="w-full rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-3 py-2 text-sm text-[#f0ece4] placeholder-[#606060] focus:border-[#ff6b35] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button onClick={generatePreview} disabled={isLoading}>
                {isLoading ? "Generating..." : "Generate Preview →"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 px-4 py-3">
              <p className="text-sm font-medium text-[#22c55e]">✓ Portfolio generated successfully!</p>
              <p className="mt-1 text-sm text-[#22c55e]/80">Review the preview on the right and save when ready.</p>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-[#1a1a1a] p-4">
              <h3 className="font-medium text-[#f0ece4]">{formData.name}&apos;s Portfolio</h3>
              <p className="text-sm text-[#a0a0a0]">{formData.tagline}</p>
              <p className="mt-2 text-sm text-[#606060]">{formData.college} • {formData.branch}</p>
              <p className="mt-1 text-sm text-[#606060]">{formData.skills?.join(", ")}</p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={() => setStep(2)}>
                ← Edit Info
              </Button>
              <Button onClick={savePortfolio} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save & Continue →"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-4">
        <div className="mb-3 text-center text-sm text-[#a0a0a0]">Live Preview</div>
        <div className="h-[calc(100%-2rem)] overflow-auto rounded-xl border border-white/[0.08] bg-white shadow-inner shadow-black/10">
          {previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              className="h-full w-full"
              title="Portfolio Preview"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-[#a0a0a0]">
              <div className="text-center">
                <div className="mb-2 text-4xl">🎨</div>
                <p>Fill in your details to see the preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
