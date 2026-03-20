"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { randomUUID } from "crypto";

import type { ChatMessage, StudentInfo, PortfolioTemplate } from "@/domain/entities/chat";
import { Button } from "@/components/ui/button";

const INITIAL_MESSAGE: ChatMessage = {
  id: "initial",
  role: "assistant",
  content: "Hi! 👋 I'm FolioAI, and I'll help you create a stunning portfolio website in just a few minutes.\n\nLet's start with the basics — what's your name, and what are you studying? (College, branch, year)",
  timestamp: new Date(),
};

type ChatInterfaceProps = {
  portfolioId?: string;
  initialMessages?: ChatMessage[];
  initialStudentInfo?: Partial<StudentInfo>;
};

export function ChatInterface({ 
  portfolioId, 
  initialMessages = [INITIAL_MESSAGE],
  initialStudentInfo = {} 
}: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [studentInfo, setStudentInfo] = useState<Partial<StudentInfo>>(initialStudentInfo);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
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

      const response = await fetch("/api/portfolios", {
        method: "POST",
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
    <div className="flex h-[calc(100vh-80px)] gap-4">
      {/* Chat Panel */}
      <div className="flex w-1/2 flex-col rounded-2xl border border-neutral-200 bg-white">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <h2 className="font-semibold text-neutral-900">Build Your Portfolio</h2>
            <p className="text-sm text-neutral-500">Chat with AI to create your site</p>
          </div>
          {readyToGenerate && !generatedHtml && (
            <Button onClick={generatePortfolio} disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate Portfolio"}
            </Button>
          )}
          {generatedHtml && (
            <Button onClick={savePortfolio} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save & Continue"}
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-violet-600 text-white"
                      : "bg-neutral-100 text-neutral-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-neutral-100 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-neutral-100 p-4">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={!input.trim() || isLoading}>
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex w-1/2 flex-col rounded-2xl border border-neutral-200 bg-white">
        {/* Preview Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <h2 className="font-semibold text-neutral-900">Live Preview</h2>
            <p className="text-sm text-neutral-500">
              {generatedHtml ? "Your portfolio is ready!" : "Preview will appear here"}
            </p>
          </div>

          {/* Template Selector */}
          {!generatedHtml && (
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as PortfolioTemplate)}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
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
              <div className="mb-4 rounded-full bg-neutral-100 p-6">
                <svg className="h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mb-2 font-medium text-neutral-900">No preview yet</h3>
              <p className="max-w-xs text-sm text-neutral-500">
                Chat with the AI to share your details. Once you have enough info, click "Generate Portfolio" to see your site.
              </p>

              {/* Info Collected Summary */}
              {Object.keys(studentInfo).length > 0 && (
                <div className="mt-6 w-full max-w-sm rounded-xl bg-white p-4 text-left shadow-sm">
                  <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Info Collected
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {studentInfo.name && (
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-neutral-600">Name: {studentInfo.name}</span>
                      </li>
                    )}
                    {studentInfo.college && (
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-neutral-600">College: {studentInfo.college}</span>
                      </li>
                    )}
                    {studentInfo.skills && studentInfo.skills.length > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-neutral-600">{studentInfo.skills.length} skills</span>
                      </li>
                    )}
                    {studentInfo.projects && studentInfo.projects.length > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-neutral-600">{studentInfo.projects.length} projects</span>
                      </li>
                    )}
                  </ul>

                  {readyToGenerate && (
                    <p className="mt-4 text-xs text-green-600">
                      ✓ Ready to generate!
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
