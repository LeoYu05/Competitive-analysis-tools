"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, History, RefreshCcw, Sparkles } from "lucide-react";

import { AnalysisForm } from "@/components/analysis-form";
import { ResultsTabs } from "@/components/results-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisInput, AnalysisResult, ApiResponse, HistoryItem } from "@/lib/types";
import {
  buildMarkdownReport,
  createClientId,
  downloadTextFile,
  formatDateTime
} from "@/lib/utils";

const HISTORY_KEY = "competeiq-history";
const loadingMessages = ["正在分析竞争格局...", "正在生成雷达评分...", "正在输出战略建议..."];

export default function Page() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentInput, setCurrentInput] = useState<AnalysisInput | null>(null);
  const [selectedInput, setSelectedInput] = useState<AnalysisInput | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(HISTORY_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as HistoryItem[];
      setHistory(parsed);
    } catch {
      window.localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) return;

    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      setStatusText(loadingMessages[index]);
    }, 1800);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  function persistHistory(items: HistoryItem[]) {
    setHistory(items);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 6)));
  }

  async function handleAnalyze(payload: AnalysisInput) {
    setIsLoading(true);
    setError(null);
    setCurrentInput(payload);
    setStatusText(loadingMessages[0]);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const json = (await response.json()) as ApiResponse<AnalysisResult>;

      if (!response.ok || !json.success) {
        throw new Error(json.success ? "分析失败，请稍后重试。" : json.error);
      }

      setResult(json.data);
      const nextHistory: HistoryItem[] = [
        {
          id: createClientId(),
          createdAt: new Date().toISOString(),
          input: payload,
          result: json.data
        },
        ...history
      ].slice(0, 6);
      persistHistory(nextHistory);
    } catch (requestError) {
      setResult(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "请求失败，请检查网络或稍后重试。"
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleExportJson() {
    if (!result) return;
    downloadTextFile(
      `competeiq-${Date.now()}.json`,
      JSON.stringify(result, null, 2),
      "application/json"
    );
  }

  function handleExportMarkdown() {
    if (!result || !currentInput) return;
    downloadTextFile(
      `competeiq-${Date.now()}.md`,
      buildMarkdownReport(currentInput, result),
      "text/markdown"
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.12),transparent_18%)]" />
      <div className="pointer-events-none fixed inset-0 bg-grid-fade bg-[size:48px_48px] opacity-[0.07]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[28px] border border-border/70 bg-white/[0.03] p-6 shadow-panel backdrop-blur-xl lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                CompeteIQ
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                输入产品与竞品，生成结构化竞品分析。
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                输出概览、雷达图、功能矩阵、SWOT 和机会点。
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["服务端调用", "API Key 不暴露"],
                ["结构化结果", "JSON 校验"],
                ["本地记录", "保留最近 6 次"]
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border/70 bg-slate-950/60 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{title}</p>
                  <p className="mt-2 text-sm text-foreground/90">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[420px,minmax(0,1fr)]">
          <div className="space-y-6">
            <AnalysisForm
              initialValue={selectedInput}
              isLoading={isLoading}
              statusText={statusText}
              onSubmit={handleAnalyze}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-cyan-200" />
                  最近分析
                </CardTitle>
                <CardDescription>浏览器本地保存最近 6 次结果。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    暂无历史记录。
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedInput(item.input);
                        setCurrentInput(item.input);
                        setResult(item.result);
                        setError(null);
                      }}
                      className="w-full rounded-2xl border border-border/70 bg-white/5 p-4 text-left transition hover:bg-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{item.input.myProduct}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.input.category} · {item.input.comp1} / {item.input.comp2}
                            {item.input.comp3 ? ` / ${item.input.comp3}` : ""}
                          </p>
                        </div>
                        <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {error ? (
              <Card className="border-rose-400/20 bg-rose-400/8">
                <CardContent className="flex items-start gap-3 p-4 text-sm text-rose-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <ResultsTabs
            input={currentInput}
            result={result}
            isLoading={isLoading}
            onExportJson={handleExportJson}
            onExportMarkdown={handleExportMarkdown}
          />
        </section>
      </div>
    </main>
  );
}
