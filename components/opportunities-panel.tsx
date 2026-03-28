"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/types";

type OpportunitiesPanelProps = {
  opportunities: AnalysisResult["opportunities"];
};

type PriorityFilter = "all" | "high" | "medium" | "low";

const priorityFilters: { id: PriorityFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "high", label: "HIGH" },
  { id: "medium", label: "MEDIUM" },
  { id: "low", label: "LOW" }
];

const priorityFilterColors: Record<PriorityFilter, { active: string; inactive: string }> = {
  all: {
    active: "bg-white/10 text-foreground ring-1 ring-white/20",
    inactive: "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
  },
  high: {
    active: "bg-rose-400/20 text-rose-200 ring-1 ring-rose-400/30",
    inactive: "bg-white/5 text-muted-foreground hover:bg-rose-400/10 hover:text-rose-200"
  },
  medium: {
    active: "bg-amber-400/20 text-amber-200 ring-1 ring-amber-400/30",
    inactive: "bg-white/5 text-muted-foreground hover:bg-amber-400/10 hover:text-amber-200"
  },
  low: {
    active: "bg-slate-400/20 text-slate-200 ring-1 ring-slate-400/30",
    inactive: "bg-white/5 text-muted-foreground hover:bg-slate-400/10 hover:text-slate-200"
  }
};

function buildSearchUrl(item: OpportunitiesPanelProps["opportunities"][number]) {
  const query = [item.title, ...item.tags].filter(Boolean).join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
      aria-label="复制内容"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "已复制" : "复制"}
    </button>
  );
}

export function OpportunitiesPanel({ opportunities }: OpportunitiesPanelProps) {
  const [filter, setFilter] = useState<PriorityFilter>("all");

  const counts: Record<PriorityFilter, number> = {
    all: opportunities.length,
    high: opportunities.filter((o) => o.priority === "high").length,
    medium: opportunities.filter((o) => o.priority === "medium").length,
    low: opportunities.filter((o) => o.priority === "low").length
  };

  const filtered = filter === "all" ? opportunities : opportunities.filter((o) => o.priority === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {priorityFilters.map((tab) => {
          const colors = priorityFilterColors[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs transition ${
                filter === tab.id ? colors.active : colors.inactive
              }`}
            >
              {tab.label}
              <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {filtered.map((item, index) => {
          const copyText = `${item.title}\n优先级：${item.priority}\n标签：${item.tags.join("、")}\n\n${item.body}${
            item.source_url
              ? `\n\n参考：${item.source_title || item.source_url} ${item.source_url}`
              : ""
          }`;

          return (
            <Card key={`${item.title}-${index}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant={item.priority}>{item.priority.toUpperCase()}</Badge>
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-6 text-foreground/85">{item.body}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {item.source_url ? (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-cyan-100 transition hover:text-cyan-50"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      {item.source_title || "打开支持链接"}
                    </a>
                  ) : (
                    <a
                      href={buildSearchUrl(item)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      搜索相关外部资料
                    </a>
                  )}
                  <CopyButton text={copyText} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
