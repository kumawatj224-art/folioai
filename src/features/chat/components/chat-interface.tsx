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
    <div className="flex h-[calc(100vh-120px)] gap-6">
      {/* Chat Panel */}
      <div className="flex w-1/2 flex-col rounded-xl border border-neutral-200 bg-white">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <h2 className="font-medium text-neutral-900">Chat</h2>
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
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-neutral-100 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-neutral-100 p-4">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm transition-colors placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:outline-none"
              disabled={isLoading}
            />
            <Button size="sm" onClick={sendMessage} disabled={!input.trim() || isLoading}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex w-1/2 flex-col rounded-xl border border-neutral-200 bg-white">
        {/* Preview Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="font-medium text-neutral-900">Preview</h2>

          {/* Template Selector */}
          {!generatedHtml && (
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as PortfolioTemplate)}
              aria-label="Select template"
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-700 focus:border-neutral-300 focus:outline-none"
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
        <div className="flex-1 overflow-hidden bg-neutral-50 p-4">
          {generatedHtml ? (
            <iframe
              srcDoc={generatedHtml}
              className="h-full w-full rounded-lg border border-neutral-200 bg-white"
              title="Portfolio Preview"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-200">
                <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-neutral-500">
                Share your details in the chat<br />to generate a preview
              </p>

              {/* Info Summary */}
              {Object.keys(studentInfo).length > 0 && (
                <div className="mt-6 w-full max-w-xs rounded-lg bg-white p-4 text-left">
                  <p className="mb-3 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                    Collected
                  </p>
                  <div className="space-y-2">
                    {studentInfo.name && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="h-1 w-1 rounded-full bg-green-500" />
                        {studentInfo.name}
                      </div>
                    )}
                    {studentInfo.college && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="h-1 w-1 rounded-full bg-green-500" />
                        {studentInfo.college}
                      </div>
                    )}
                    {studentInfo.skills && studentInfo.skills.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="h-1 w-1 rounded-full bg-green-500" />
                        {studentInfo.skills.length} skills
                      </div>
                    )}
                    {studentInfo.projects && studentInfo.projects.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="h-1 w-1 rounded-full bg-green-500" />
                        {studentInfo.projects.length} projects
                      </div>
                    )}
                  </div>

                  {readyToGenerate && (
                    <p className="mt-4 text-xs text-green-600">
                      Ready to generate
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
