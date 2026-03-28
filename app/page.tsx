"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, History, RefreshCcw, Sparkles, Trash2 } from "lucide-react";

import { AnalysisForm } from "@/components/analysis-form";
import { ResultsTabs } from "@/components/results-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalysisInput, AnalysisResult, ApiError, HistoryItem } from "@/lib/types";
import {
  buildMarkdownReport,
  createClientId,
  downloadTextFile,
  formatDateTime
} from "@/lib/utils";

const HISTORY_KEY = "competeiq-history";
const HISTORY_LIMIT = 10;

function normalizeInput(input: AnalysisInput): AnalysisInput {
  return {
    ...input,
    myDesc: input.myDesc ?? "",
    comp1Category: input.comp1Category ?? "",
    comp1Desc: input.comp1Desc ?? "",
    comp2Category: input.comp2Category ?? "",
    comp2Desc: input.comp2Desc ?? "",
    comp3: input.comp3 ?? "",
    comp3Category: input.comp3Category ?? "",
    comp3Desc: input.comp3Desc ?? ""
  };
}

export default function Page() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentInput, setCurrentInput] = useState<AnalysisInput | null>(null);
  const [selectedInput, setSelectedInput] = useState<AnalysisInput | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<AnalysisInput | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(HISTORY_KEY);
    if (!stored) return;

    try {
      const parsed = (JSON.parse(stored) as HistoryItem[]).map((item) => ({
        ...item,
        input: normalizeInput(item.input)
      }));
      setHistory(parsed);
    } catch {
      window.localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  function persistHistory(items: HistoryItem[]) {
    const nextItems = items.slice(0, HISTORY_LIMIT);
    setHistory(nextItems);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextItems));
  }

  function clearSelectedResult(itemId?: string) {
    if (!itemId) {
      setSelectedInput(null);
      setCurrentInput(null);
      setResult(null);
      setError(null);
      return;
    }

    const activeHistoryId = history.find(
      (item) => item.input === currentInput && item.result === result
    )?.id;
    if (activeHistoryId === itemId) {
      setSelectedInput(null);
      setCurrentInput(null);
      setResult(null);
      setError(null);
    }
  }

  function handleDeleteHistoryItem(itemId: string) {
    const nextHistory = history.filter((item) => item.id !== itemId);
    persistHistory(nextHistory);
    clearSelectedResult(itemId);
  }

  function handleClearHistory() {
    persistHistory([]);
    clearSelectedResult();
  }

  async function handleAnalyze(payload: AnalysisInput) {
    const normalizedPayload = normalizeInput(payload);
    setLastPayload(normalizedPayload);
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentInput(normalizedPayload);
    setStatusText("正在准备分析...");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedPayload)
      });

      if (!response.ok) {
        const json = (await response.json()) as ApiError;
        throw new Error(json.error || "请求失败，请检查网络或稍后重试。");
      }

      if (!response.body) {
        throw new Error("服务端未返回数据流，请稍后重试。");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let didReceiveResult = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const raw = part.slice(6).trim();
          if (!raw) continue;

          let event: { type: string; message?: string; data?: AnalysisResult };
          try {
            event = JSON.parse(raw);
          } catch {
            continue;
          }

          if (event.type === "phase" && event.message) {
            setStatusText(event.message);
          } else if (event.type === "result" && event.data) {
            didReceiveResult = true;
            setResult(event.data);
            setIsLoading(false);
            const nextHistory: HistoryItem[] = [
              {
                id: createClientId(),
                createdAt: new Date().toISOString(),
                input: normalizedPayload,
                result: event.data
              },
              ...history
            ].slice(0, HISTORY_LIMIT);
            persistHistory(nextHistory);
          } else if (event.type === "error" && event.message) {
            throw new Error(event.message);
          }
        }
      }

      if (!didReceiveResult) {
        throw new Error("分析未完成，请稍后重试。");
      }
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
        <section className="mb-8 rounded-[28px] border border-border/70 bg-white/[0.03] p-6 shadow-panel backdrop-blur-xl lg:p-8 print:hidden">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" />
              CompeteIQ
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              结构化输出竞品分析，直接看清差异和机会。
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              输入我方产品与竞品信息，生成概览、雷达图、功能矩阵、SWOT 和机会点，适合用于产品判断、方案对比和增长讨论。
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[420px,minmax(0,1fr)]">
          <div className="space-y-6 print:hidden">
            <AnalysisForm
              initialValue={selectedInput}
              isLoading={isLoading}
              statusText={statusText}
              onSubmit={handleAnalyze}
            />

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-cyan-200" />
                      最近分析
                    </CardTitle>
                    <CardDescription>浏览器本地保存最近 {HISTORY_LIMIT} 次结果。</CardDescription>
                  </div>
                  {history.length > 0 ? (
                    <Button variant="ghost" size="sm" onClick={handleClearHistory}>
                      <Trash2 className="h-4 w-4" />
                      清空
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    暂无历史记录。
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-border/70 bg-white/5 p-4 transition hover:bg-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInput(item.input);
                            setCurrentInput(item.input);
                            setResult(item.result);
                            setError(null);
                          }}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{item.input.myProduct}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {item.input.category} · {item.input.comp1} / {item.input.comp2}
                                {item.input.comp3 ? ` / ${item.input.comp3}` : ""}
                              </p>
                            </div>
                            <RefreshCcw className="h-4 w-4 shrink-0 text-muted-foreground" />
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">
                            {formatDateTime(item.createdAt)}
                          </p>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          aria-label={`删除 ${item.input.myProduct} 的历史记录`}
                          onClick={() => handleDeleteHistoryItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {error ? (
              <Card className="border-rose-400/20 bg-rose-400/8">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 text-sm text-rose-100">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                  {lastPayload ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 border-rose-400/30 text-rose-100 hover:bg-rose-400/10"
                      onClick={() => handleAnalyze(lastPayload)}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      重新分析
                    </Button>
                  ) : null}
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
