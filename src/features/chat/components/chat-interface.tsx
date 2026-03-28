"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { randomUUID } from "crypto";

import type { ChatMessage, StudentInfo, PortfolioTemplate } from "@/domain/entities/chat";
import { Button } from "@/components/ui/button";

const INITIAL_MESSAGE: ChatMessage = {
  id: "initial",
  role: "assistant",
  content: "Hi! I'm FolioAI. I'll help you create a professional portfolio.\n\nLet's start — what's your name and what do you study?",
  timestamp: new Date(),
};

type ChatInterfaceProps = {
  portfolioId?: string;
  initialMessages?: ChatMessage[];
  initialStudentInfo?: Partial<StudentInfo>;
  initialHtml?: string | null;
};

export function ChatInterface({ 
  portfolioId, 
  initialMessages = [INITIAL_MESSAGE],
  initialStudentInfo = {},
  initialHtml = null,
}: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [studentInfo, setStudentInfo] = useState<Partial<StudentInfo>>(initialStudentInfo);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(initialHtml);
  const [existingHtml] = useState<string | null>(initialHtml); // Keep original for AI context
  const [selectedTemplate, setSelectedTemplate] = useState<PortfolioTemplate>("minimal-dark");
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
          existingHtml: existingHtml, // Pass current portfolio HTML for AI context
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const generatePortfolio = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          studentInfo,
          action: "generate",
          template: selectedTemplate,
          existingHtml: existingHtml, // Pass existing HTML for context when regenerating
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate portfolio");
      }

      setGeneratedHtml(data.html);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setIsLoading(false);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const templates: { id: PortfolioTemplate; name: string; description: string }[] = [
    { id: "minimal-dark", name: "Minimal Dark", description: "Clean, developer-focused" },
    { id: "professional-light", name: "Professional Light", description: "Corporate, structured" },
    { id: "colorful", name: "Colorful", description: "Creative, eye-catching" },
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Chat Panel */}
      <div className="flex w-[420px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111]">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div>
            <h2 className="font-display font-semibold text-[#f0ece4]">Chat</h2>
          </div>
          {readyToGenerate && !generatedHtml && (
            <Button size="sm" onClick={generatePortfolio} disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          )}
          {generatedHtml && (
            <Button size="sm" onClick={savePortfolio} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#ff6b35] text-[10px] font-bold text-white">
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
                <div className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#ff6b35] text-[10px] font-bold text-white">
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
          <div className="mx-5 mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-white/[0.08] p-4">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message FolioAI..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-white/[0.08] bg-[#1a1a1a] px-4 py-2.5 text-sm text-[#f0ece4] transition-colors placeholder:text-[#606060] focus:border-white/[0.15] focus:bg-[#222222] focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#ff6b35] text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↑
            </button>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a]">
        {/* Preview Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#111111] px-5 py-4">
          <h2 className="font-display font-semibold text-[#f0ece4]">Live Preview</h2>

          {/* Template Selector */}
          {!generatedHtml && (
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as PortfolioTemplate)}
              aria-label="Select template"
              className="rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-3 py-1.5 text-sm text-[#a0a0a0] focus:border-white/[0.15] focus:outline-none"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden p-5">
          {generatedHtml ? (
            <iframe
              srcDoc={generatedHtml}
              className="h-full w-full rounded-xl border border-white/[0.08]"
              title="Portfolio Preview"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-center">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,107,53,0.2)_0%,transparent_60%)]" />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05]">
                <svg className="h-6 w-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="relative text-sm text-white/50">
                Share your details in the chat<br />to generate a preview
              </p>

              {/* Info Summary */}
              {Object.keys(studentInfo).length > 0 && (
                <div className="relative mt-6 w-full max-w-xs rounded-xl border border-white/[0.1] bg-white/[0.05] p-4 text-left">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
                    Collected
                  </p>
                  <div className="space-y-2">
                    {studentInfo.name && (
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span className="h-1 w-1 rounded-full bg-[#22c55e]" />
                        {studentInfo.name}
                      </div>
                    )}
                    {studentInfo.college && (
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span className="h-1 w-1 rounded-full bg-[#22c55e]" />
                        {studentInfo.college}
                      </div>
                    )}
                    {studentInfo.skills && studentInfo.skills.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span className="h-1 w-1 rounded-full bg-[#22c55e]" />
                        {studentInfo.skills.length} skills
                      </div>
                    )}
                    {studentInfo.projects && studentInfo.projects.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span className="h-1 w-1 rounded-full bg-[#22c55e]" />
                        {studentInfo.projects.length} projects
                      </div>
                    )}
                  </div>

                  {readyToGenerate && (
                    <p className="mt-4 text-xs text-[#22c55e]">
                      ✓ Ready to generate
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
