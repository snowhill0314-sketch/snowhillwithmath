"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  BookOpen,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "분수의 덧셈은 어떻게 해요?",
  "-3 + (-5)는 얼마예요?",
  "방정식 2x + 4 = 10을 풀어주세요",
  "피타고라스 정리가 뭐예요?",
  "소수와 합성수의 차이를 알려주세요",
  "평균, 중앙값, 최빈값의 차이가 뭐예요?",
];

function formatMessageContent(content: string): React.ReactNode {
  // Split by newlines and render
  const lines = content.split("\n");
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

export default function MathChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요! 저는 수학이예요 🎉\n수학에 관한 질문이라면 뭐든지 물어보세요!\n정수, 분수, 방정식, 함수, 도형... 어떤 것이든 친절하게 설명해 드릴게요 📚",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        const historyForAPI = [...messages, userMessage]
          .filter((m) => m.id !== "welcome")
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyForAPI }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error ?? "알 수 없는 오류가 발생했습니다.");
        }

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "오류가 발생했습니다.";
        setError(msg);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages, isLoading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "안녕하세요! 저는 수학이예요 🎉\n수학에 관한 질문이라면 뭐든지 물어보세요!\n정수, 분수, 방정식, 함수, 도형... 어떤 것이든 친절하게 설명해 드릴게요 📚",
        timestamp: new Date(),
      },
    ]);
    setError(null);
    setInput("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
            <Sparkles className="h-3 w-3" />
            <span>AI 수학 튜터</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            수학이 챗봇
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            어떤 수학 문제든 물어보세요! AI가 단계별로 친절하게 설명해
            드립니다.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all duration-200 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          대화 초기화
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
        {/* Sidebar: Quick Questions */}
        <aside className="lg:col-span-1 flex flex-col gap-4">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/60">
            <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white mb-4">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              자주 묻는 질문
            </h2>
            <div className="flex flex-col gap-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg px-3 py-2.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30"
                >
                  <ChevronRight className="h-3 w-3 shrink-0 text-indigo-400" />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-950/20">
            <h2 className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-400 mb-3">
              <Sparkles className="h-4 w-4" />
              사용 팁
            </h2>
            <ul className="space-y-2 text-xs text-amber-700 dark:text-amber-400/80">
              <li>✏️ 풀이과정이 궁금하면 "단계별로" 라고 덧붙여 보세요</li>
              <li>🔢 구체적인 숫자를 넣어 질문하면 더 정확해요</li>
              <li>❓ 이해가 안 되면 "다시 설명해줘"라고 말해보세요</li>
              <li>📐 도형 문제는 조건을 최대한 자세히 적어주세요</li>
            </ul>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col gap-0 rounded-2xl border border-zinc-200/80 bg-white shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/60 overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-900 shadow" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                수학이 🤖
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                온라인 · GPT-4o mini 기반
              </p>
            </div>
            <div className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
              {messages.length - 1}개의 메시지
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[400px] max-h-[520px] scroll-smooth">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
              <div className="absolute top-20 right-10 w-48 h-48 bg-indigo-100/20 rounded-full blur-3xl dark:bg-indigo-900/10" />
              <div className="absolute bottom-20 left-10 w-48 h-48 bg-purple-100/20 rounded-full blur-3xl dark:bg-purple-900/10" />
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  {msg.role === "assistant" ? (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 dark:from-zinc-400 dark:to-zinc-600 flex items-center justify-center shadow-sm">
                      <User className="h-4 w-4 text-white dark:text-zinc-900" />
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`flex flex-col gap-1 max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === "assistant"
                        ? "bg-zinc-50 border border-zinc-100 text-zinc-800 dark:bg-zinc-800/60 dark:border-zinc-700/60 dark:text-zinc-200 rounded-tl-sm"
                        : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm"
                    }`}
                  >
                    {formatMessageContent(msg.content)}
                  </div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 flex-row">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-zinc-50 border border-zinc-100 dark:bg-zinc-800/60 dark:border-zinc-700/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    수학이가 생각하는 중...
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200/60 p-4 text-sm text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">오류 발생</p>
                  <p className="mt-0.5 text-xs opacity-80">{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/40">
            <form onSubmit={handleSubmit} className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  id="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  rows={1}
                  placeholder="수학 질문을 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500 transition-all duration-200 disabled:opacity-50 shadow-sm"
                  style={{
                    minHeight: "48px",
                    maxHeight: "144px",
                    overflowY: "auto",
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${Math.min(target.scrollHeight, 144)}px`;
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                id="send-button"
                className="h-12 w-12 shrink-0 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-zinc-400 dark:text-zinc-500">
              AI가 생성한 답변은 참고용이며, 중요한 내용은 선생님께 확인하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
