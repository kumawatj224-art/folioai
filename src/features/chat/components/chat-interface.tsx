"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import type { ChatMessage, StudentInfo } from "@/domain/entities/chat";
import { Button } from "@/components/ui/button";

// Icons as components for cleaner code
const IconExpand = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
  </svg>
);

const IconCollapse = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
  </svg>
);

const IconDownload = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const IconRefresh = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const IconCode = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

const INITIAL_MESSAGE: ChatMessage = {
  id: "initial",
  role: "assistant",
  content: "Hi! I'm FolioAI. I'll help you create a professional portfolio.\n\nLet's start — what's your name and what do you study?\n\n💡 **Tip:** You can upload your resume to skip the Q&A!",
  timestamp: new Date(),
};

const EDIT_MODE_MESSAGE: ChatMessage = {
  id: "initial",
  role: "assistant",
  content: "Welcome back! 👋 Your portfolio data is saved.\n\nWhat would you like to change?\n\n• **Change template** — try a different design\n• **Add info** — new skills, project, or achievement\n• **Update details** — modify existing content\n\nOr just click **Re-Generate** to refresh with the same data!",
  timestamp: new Date(),
};

type ChatInterfaceProps = {
  portfolioId?: string;
  initialMessages?: ChatMessage[];
  initialStudentInfo?: Partial<StudentInfo>;
  initialHtml?: string | null;
  initialLiveUrl?: string | null;
};

export function ChatInterface({ 
  portfolioId, 
  initialMessages,
  initialStudentInfo = {},
  initialHtml = null,
  initialLiveUrl = null,
}: ChatInterfaceProps) {
  const router = useRouter();
  
  // Determine if we're in edit mode (existing portfolio)
  const isEditMode = !!portfolioId && !!initialHtml;
  
  // Determine initial message based on context
  const defaultMessages = initialMessages || [
    isEditMode ? EDIT_MODE_MESSAGE : INITIAL_MESSAGE
  ];
  
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [studentInfo, setStudentInfo] = useState<Partial<StudentInfo>>(initialStudentInfo);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(initialLiveUrl);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(initialHtml);
  const [currentPortfolioHtml, setCurrentPortfolioHtml] = useState<string | null>(initialHtml); // Tracks latest HTML for AI context
  const [readyToGenerate, setReadyToGenerate] = useState(isEditMode); // Always ready in edit mode
  const [hasChanges, setHasChanges] = useState(false); // Track if user made changes in edit mode
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Preview panel state
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Download HTML file
  const downloadHtml = useCallback(() => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studentInfo.name || "portfolio"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedHtml, studentInfo.name]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          studentInfo,
          action: "chat",
          existingHtml: currentPortfolioHtml, // Pass current portfolio HTML for AI context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStudentInfo(data.studentInfo);
      setReadyToGenerate(data.readyToGenerate);
      
      // Mark that user made changes (for edit mode)
      if (isEditMode) {
        setHasChanges(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const generatePortfolio = async () => {
    setIsLoading(true);
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          studentInfo,
          action: "generate",
          existingHtml: currentPortfolioHtml, // Pass existing HTML for context when regenerating
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate portfolio");
      }

      setGeneratedHtml(data.html);
      setCurrentPortfolioHtml(data.html); // Update context for future regenerations
      setHasChanges(false); // Reset after regenerating
      
      // Clear deployed URL if HTML changed - user needs to redeploy
      if (deployedUrl && data.html !== initialHtml) {
        setDeployedUrl(null);
      }
      
      // Refresh server components (UsageBanner) to show updated counts
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const savePortfolio = async () => {
    if (!generatedHtml) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const title = studentInfo.name 
        ? `${studentInfo.name}'s Portfolio`
        : "My Portfolio";

      // Use PATCH for existing portfolio, POST for new
      const isEditing = !!portfolioId;
      const url = isEditing ? `/api/portfolios/${portfolioId}` : "/api/portfolios";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          htmlContent: generatedHtml,
          chatHistory: messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save");
      }

      // Redirect to portfolio page
      router.push(`/portfolio/${data.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  const deployPortfolio = async () => {
    if (!generatedHtml) return;
    
    // Ask for subdomain name
    const defaultName = studentInfo.name 
      ? studentInfo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : "";
    
    const subdomainInput = window.prompt(
      "Enter your subdomain name (e.g., 'jai' for jai.getfolioai.in):",
      defaultName
    );
    
    if (subdomainInput === null) {
      // User cancelled
      return;
    }
    
    // Validate and clean subdomain
    const subdomain = subdomainInput
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30);
    
    if (!subdomain) {
      setError("Please enter a valid subdomain name");
      return;
    }
    
    setIsDeploying(true);
    setError(null);

    try {
      // Only set title for new portfolios
      const title = studentInfo.name 
        ? `${studentInfo.name}'s Portfolio`
        : "My Portfolio";

      // Create or update portfolio with deployed status
      const isEditing = !!portfolioId;
      const url = isEditing ? `/api/portfolios/${portfolioId}` : "/api/portfolios";
      const method = isEditing ? "PATCH" : "POST";

      // When editing, don't send title to preserve the original
      const body: Record<string, unknown> = {
        htmlContent: generatedHtml,
        chatHistory: messages,
        status: "deployed",
        customSubdomain: subdomain, // Send user's chosen subdomain
      };
      
      // Only include title for new portfolios
      if (!isEditing) {
        body.title = title;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to deploy");
      }

      // Use the liveUrl returned from the API
      const portfolio = data.data;
      if (!portfolio) {
        throw new Error("Failed to save portfolio");
      }
      
      // Show appropriate URL based on environment
      const host = window.location.host;
      let deployUrl = portfolio.liveUrl;
      
      // For localhost, show the local test URL instead of production subdomain
      if (host.includes("localhost")) {
        // Extract subdomain from liveUrl (e.g., https://jai.getfolioai.in -> jai)
        const slugMatch = portfolio.liveUrl?.match(/https?:\/\/([^.]+)\.getfolioai\.in/);
        const slug = slugMatch ? slugMatch[1] : subdomain;
        deployUrl = `${window.location.origin}/api/p/${slug}`;
      }
      
      if (deployUrl) {
        setDeployedUrl(deployUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deploy");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    setError(null);

    // Add user message showing upload
    const uploadMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: `📄 Uploading resume: ${file.name}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, uploadMessage]);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse resume");
      }

      // In edit mode, merge new data with existing; otherwise replace
      const newInfo = data.studentInfo;
      if (isEditMode) {
        // Smart merge: keep existing values, add new ones, combine arrays
        setStudentInfo((prev) => ({
          ...prev,
          ...newInfo,
          // Always prefer new name if provided
          name: newInfo.name || prev.name,
          college: newInfo.college || prev.college,
          branch: newInfo.branch || prev.branch,
          graduationYear: newInfo.graduationYear || prev.graduationYear,
          // Merge arrays and deduplicate
          skills: [...new Set([...(prev.skills || []), ...(newInfo.skills || [])])],
          achievements: [...new Set([...(prev.achievements || []), ...(newInfo.achievements || [])])],
          projects: [...(prev.projects || []), ...(newInfo.projects || [])].filter(
            (p, i, arr) => arr.findIndex((x) => x.title === p.title) === i
          ),
          internships: [...(prev.internships || []), ...(newInfo.internships || [])].filter(
            (p, i, arr) => arr.findIndex((x) => x.company === p.company && x.role === p.role) === i
          ),
          socialLinks: { ...(prev.socialLinks || {}), ...(newInfo.socialLinks || {}) },
        }));
      } else {
        setStudentInfo(newInfo);
      }

      // Check if ready to generate - only require name to enable generation
      const ready = Boolean(newInfo.name);
      setReadyToGenerate(ready);
      console.log('[FolioAI] Resume parsed:', {
        name: newInfo.name,
        college: newInfo.college,
        skillsCount: newInfo.skills?.length ?? 0,
        projectsCount: newInfo.projects?.length ?? 0,
        readyToGenerate: ready
      });

      // Add assistant message confirming extraction
      const confirmMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: isEditMode 
          ? `I've merged the new resume data with your existing portfolio:\n\n` +
            `📛 **Name:** ${newInfo.name || "Unchanged"}\n` +
            `🎓 **Education:** ${newInfo.college || "Unchanged"}${newInfo.branch ? `, ${newInfo.branch}` : ""}\n` +
            `💻 **New Skills:** ${newInfo.skills?.length ? newInfo.skills.slice(0, 5).join(", ") + (newInfo.skills.length > 5 ? `... +${newInfo.skills.length - 5} more` : "") : "None"}\n` +
            `🚀 **New Projects:** ${newInfo.projects?.length || 0} added\n` +
            `💼 **New Experience:** ${newInfo.internships?.length || 0} added\n\n` +
            "✅ Your portfolio data has been updated. Click **Re-Generate** to apply the changes!"
          : `Great! I extracted your information from the resume:\n\n` +
            `📛 **Name:** ${newInfo.name || "Not found"}\n` +
            `🎓 **Education:** ${newInfo.college || "Not found"}${newInfo.branch ? `, ${newInfo.branch}` : ""}${newInfo.graduationYear ? ` (${newInfo.graduationYear})` : ""}\n` +
            `💻 **Skills:** ${newInfo.skills?.length ? newInfo.skills.slice(0, 5).join(", ") + (newInfo.skills.length > 5 ? `... and ${newInfo.skills.length - 5} more` : "") : "None found"}\n` +
            `🚀 **Projects:** ${newInfo.projects?.length || 0} found\n` +
            `💼 **Experience:** ${newInfo.internships?.length || 0} entries\n\n` +
            (ready 
              ? "✅ You're all set! Click **Generate** to create your portfolio, or tell me if you'd like to add or change anything."
              : "I need a bit more info. Could you share a couple more details?"),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, confirmMessage]);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse resume");
      // Add error message
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Sorry, I couldn't parse that resume. ${err instanceof Error ? err.message : "Please try again or tell me about yourself manually."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsUploadingResume(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`flex h-[calc(100vh-140px)] gap-4 transition-all duration-300 ${isPreviewExpanded ? "gap-0" : ""}`}>
      {/* Chat Panel - Hide when preview is expanded */}
      <div className={`flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111] transition-all duration-300 ${
        isPreviewExpanded ? "w-0 opacity-0 pointer-events-none" : "w-[400px] flex-shrink-0"
      }`}>
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b35] to-[#ff8f5a]">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#f0ece4]">FolioAI</h2>
              <p className="text-xs text-[#606060]">{isEditMode ? "Editing mode" : "Chat"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* New portfolio: Show Generate when ready */}
            {!isEditMode && readyToGenerate && !generatedHtml && (
              <Button size="sm" onClick={generatePortfolio} disabled={isLoading}>
                {isLoading ? "Generating..." : "Generate"}
              </Button>
            )}
            
            {/* Show Save when there's generated HTML (new or regenerated) */}
            {generatedHtml && !deployedUrl && (
              <Button size="sm" variant="secondary" onClick={savePortfolio} disabled={isLoading}>
                {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Save Draft"}
              </Button>
            )}
            
            {/* Show Deploy button when there's generated HTML */}
            {generatedHtml && !deployedUrl && (
              <Button size="sm" onClick={deployPortfolio} disabled={isDeploying || isLoading}>
                {isDeploying ? "Deploying..." : isEditMode ? "🚀 Update Live" : "🚀 Deploy"}
              </Button>
            )}
            
            {/* Show deployed URL */}
            {deployedUrl && (
              <a 
                href={deployedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30 transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                Live: {deployedUrl.replace("https://", "")}
              </a>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ff8f5a] text-[10px] font-bold text-white">
                    F
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-4 py-2.5 ${
                    message.role === "user"
                      ? "rounded-[18px_18px_4px_18px] bg-[#ff6b35] text-white"
                      : "rounded-[4px_18px_18px_18px] border border-white/[0.08] bg-[#1a1a1a] text-[#f0ece4]"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ff8f5a] text-[10px] font-bold text-white">
                  F
                </div>
                <div className="rounded-[4px_18px_18px_18px] border border-white/[0.08] bg-[#1a1a1a] px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#606060]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#606060] [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#606060] [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Generate Portfolio CTA - Shows when ready but not yet generated */}
        {!isEditMode && readyToGenerate && !generatedHtml && (
          <div className="mx-4 mb-3 rounded-xl border border-[#ff6b35]/30 bg-gradient-to-r from-[#ff6b35]/10 to-[#ff8f5a]/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#f0ece4]">Ready to generate your portfolio!</p>
                <p className="text-xs text-[#a0a0a0]">All required info collected</p>
              </div>
              <button
                onClick={generatePortfolio}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-[#ff6b35] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#ff7f4a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                    </svg>
                    Generate Portfolio
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Regenerate CTA - Shows in edit mode when there are changes */}
        {isEditMode && hasChanges && (
          <div className="mx-4 mb-3 rounded-xl border border-[#3b82f6]/30 bg-gradient-to-r from-[#3b82f6]/10 to-[#60a5fa]/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#f0ece4]">Ready to update your portfolio</p>
                <p className="text-xs text-[#a0a0a0]">New changes detected</p>
              </div>
              <button
                onClick={generatePortfolio}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#4b8df6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Regenerating..." : "Regenerate"}
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-white/[0.08] p-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleResumeUpload}
            className="hidden"
            disabled={isLoading || isUploadingResume}
            aria-label="Upload resume file"
          />
          
          <div className="flex gap-2">
            {/* Upload Resume Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isUploadingResume}
              title={isEditMode ? "Upload Resume to update portfolio (PDF or DOCX)" : "Upload Resume (PDF or DOCX)"}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#1a1a1a] text-[#a0a0a0] transition-all hover:border-white/[0.15] hover:bg-[#222222] hover:text-[#f0ece4] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploadingResume ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              )}
            </button>
            
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isUploadingResume ? "Parsing resume..." : "Message FolioAI..."}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-white/[0.08] bg-[#1a1a1a] px-4 py-2.5 text-sm text-[#f0ece4] transition-colors placeholder:text-[#606060] focus:border-white/[0.15] focus:bg-[#222222] focus:outline-none"
              disabled={isLoading || isUploadingResume}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || isUploadingResume}
              title="Send message"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#ff6b35] text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
          
          {/* Upload hint - only show when no info collected yet */}
          {!isEditMode && Object.keys(studentInfo).length === 0 && !isUploadingResume && (
            <p className="mt-2 text-center text-xs text-[#606060]">
              Upload resume or chat to get started
            </p>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <div className={`flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a] transition-all duration-300 ${
        isPreviewExpanded ? "flex-1" : "flex-1"
      }`}>
        {/* Preview Header - Claude-style with tabs and actions */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#111111] px-4 py-2.5">
          <div className="flex items-center gap-3">
            {/* Collapse button when expanded */}
            {isPreviewExpanded && (
              <button
                onClick={() => setIsPreviewExpanded(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a0a0a0] transition-colors hover:bg-white/[0.05] hover:text-[#f0ece4]"
                title="Show chat"
              >
                <IconCollapse />
              </button>
            )}
            
            {/* Code/HTML Badge - like Claude */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-md bg-[#1a1a1a] px-2.5 py-1.5">
                <IconCode />
                <span className="text-xs font-medium text-[#a0a0a0]">
                  {studentInfo.name ? `${studentInfo.name}'s portfolio` : "Portfolio"}
                </span>
              </div>
              {generatedHtml && (
                <span className="rounded bg-[#22c55e]/20 px-2 py-0.5 text-xs font-medium text-[#22c55e]">
                  HTML
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Action buttons - visible when HTML exists */}
            {generatedHtml && (
              <button
                onClick={downloadHtml}
                className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[#a0a0a0] transition-colors hover:bg-white/[0.05] hover:text-[#f0ece4]"
                title="Download HTML"
              >
                <IconDownload />
                <span className="text-xs">Download</span>
              </button>
            )}

            <div className="mx-1 h-4 w-px bg-white/[0.08]" />

            {/* Expand/Collapse Toggle */}
            <button
              onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a0a0a0] transition-colors hover:bg-white/[0.05] hover:text-[#f0ece4]"
              title={isPreviewExpanded ? "Exit fullscreen" : "Fullscreen preview"}
            >
              {isPreviewExpanded ? <IconCollapse /> : <IconExpand />}
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden p-3 relative">
          {/* Cooking Overlay */}
          {isGenerating && (
            <div className="absolute inset-3 z-10 flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] backdrop-blur-sm">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,53,0.2)_0%,transparent_70%)]" />
              
              {/* Cooking animation */}
              <div className="relative mb-8">
                <div className="h-20 w-20 rounded-full border-4 border-white/10 border-t-[#ff6b35] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl">👨‍🍳</span>
                </div>
              </div>
              
              <h3 className="relative mb-3 text-xl font-semibold text-white">
                Cooking your portfolio...
              </h3>
              <p className="relative max-w-xs text-center text-sm text-white/60">
                Please wait while our AI chef prepares something amazing for you
              </p>
              
              {/* Loading dots */}
              <div className="mt-6 flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#ff6b35] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-[#ff6b35] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-[#ff6b35] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          
          {generatedHtml ? (
            <iframe
              srcDoc={generatedHtml}
              className="h-full w-full rounded-xl border border-white/[0.08] bg-white"
              title="Portfolio Preview"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-center">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,107,53,0.15)_0%,transparent_60%)]" />
              
              {/* Empty state illustration */}
              <div className="relative mb-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.05] shadow-lg">
                  <svg className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                </div>
                {/* Decorative dots */}
                <div className="absolute -right-8 -top-4 h-2 w-2 rounded-full bg-[#ff6b35]/40" />
                <div className="absolute -left-6 top-8 h-1.5 w-1.5 rounded-full bg-[#22c55e]/40" />
              </div>

              <h3 className="relative mb-2 text-lg font-semibold text-white/80">
                Your portfolio preview
              </h3>
              <p className="relative mb-8 max-w-sm text-sm text-white/50">
                Chat on the left to share your details, or upload your resume to auto-fill
              </p>

              {/* Info Summary Card */}
              {Object.keys(studentInfo).length > 0 && (
                <div className="relative w-full max-w-sm rounded-xl border border-white/[0.1] bg-white/[0.05] p-5 text-left backdrop-blur-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                      Collected Info
                    </p>
                    {readyToGenerate && (
                      <span className="flex items-center gap-1 rounded-full bg-[#22c55e]/20 px-2 py-0.5 text-xs font-medium text-[#22c55e]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                        Ready
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {studentInfo.name && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e]/20">
                          <svg className="h-4 w-4 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/80">{studentInfo.name}</p>
                          <p className="text-xs text-white/40">Name</p>
                        </div>
                      </div>
                    )}
                    
                    {studentInfo.college && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b82f6]/20">
                          <svg className="h-4 w-4 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/80">{studentInfo.college}</p>
                          <p className="text-xs text-white/40">Education</p>
                        </div>
                      </div>
                    )}

                    {/* Skills & Projects summary */}
                    <div className="flex gap-3 pt-2">
                      {studentInfo.skills && studentInfo.skills.length > 0 && (
                        <div className="flex-1 rounded-lg bg-white/[0.05] px-3 py-2 text-center">
                          <p className="text-lg font-semibold text-[#ff6b35]">{studentInfo.skills.length}</p>
                          <p className="text-xs text-white/40">Skills</p>
                        </div>
                      )}
                      {studentInfo.projects && studentInfo.projects.length > 0 && (
                        <div className="flex-1 rounded-lg bg-white/[0.05] px-3 py-2 text-center">
                          <p className="text-lg font-semibold text-[#22c55e]">{studentInfo.projects.length}</p>
                          <p className="text-xs text-white/40">Projects</p>
                        </div>
                      )}
                      {studentInfo.internships && studentInfo.internships.length > 0 && (
                        <div className="flex-1 rounded-lg bg-white/[0.05] px-3 py-2 text-center">
                          <p className="text-lg font-semibold text-[#3b82f6]">{studentInfo.internships.length}</p>
                          <p className="text-xs text-white/40">Experience</p>
                        </div>
                      )}
                    </div>

                    {/* Generate Button inside card */}
                    {studentInfo.name && (
                      <button
                        onClick={generatePortfolio}
                        disabled={isLoading}
                        className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ff6b35] to-[#ff8f5a] px-4 py-3 text-sm font-semibold text-white transition-all hover:from-[#ff7f4a] hover:to-[#ff9f6a] disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-[#ff6b35]/20"
                      >
                        {isLoading ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Cooking...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                            </svg>
                            Generate Portfolio
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* CTA when no info */}
              {Object.keys(studentInfo).length === 0 && (
                <div className="relative flex gap-3">
                  <div className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-sm text-white/60">
                    💬 Start chatting
                  </div>
                  <div className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-sm text-white/60">
                    📄 Upload resume
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
