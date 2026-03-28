"use client";

import { Fragment, useState } from "react";
import { Check, Circle, CircleDot } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/types";

type FeaturesPanelProps = {
  features: AnalysisResult["features"];
};

const scoreMeta = {
  yes: { label: "支持", icon: Check, className: "text-emerald-300" },
  partial: { label: "部分支持", icon: CircleDot, className: "text-amber-300" },
  no: { label: "未覆盖", icon: Circle, className: "text-slate-400" }
};

type FilterMode = "all" | "advantage" | "gap" | "baseline";

const filterTabs: { id: FilterMode; label: string; desc: string }[] = [
  { id: "all", label: "全部", desc: "所有功能维度" },
  { id: "advantage", label: "我的优势", desc: "我方领先竞品的功能" },
  { id: "gap", label: "待补强", desc: "竞品有而我方缺失的功能" },
  { id: "baseline", label: "标准配置", desc: "所有产品均支持的功能" }
];

export function FeaturesPanel({ features }: FeaturesPanelProps) {
  const [filter, setFilter] = useState<FilterMode>("all");

  const products = Object.keys(features[0]?.scores ?? {});
  const myProduct = products[0];
  const competitors = products.slice(1);

  function getFilteredFeatures() {
    return features.filter((feature) => {
      const myScore = feature.scores[myProduct];
      const compScores = competitors.map((p) => feature.scores[p]);

      if (filter === "advantage") {
        return (
          (myScore === "yes" || myScore === "partial") &&
          compScores.some((s) => s === "no" || (myScore === "yes" && s === "partial"))
        );
      }
      if (filter === "gap") {
        return (
          (myScore === "no" || myScore === "partial") &&
          compScores.some((s) => s === "yes")
        );
      }
      if (filter === "baseline") {
        return products.every((p) => feature.scores[p] === "yes");
      }
      return true;
    });
  }

  const filteredFeatures = getFilteredFeatures();

  const counts: Record<FilterMode, number> = {
    all: features.length,
    advantage: features.filter((f) => {
      const my = f.scores[myProduct];
      const comps = competitors.map((p) => f.scores[p]);
      return (
        (my === "yes" || my === "partial") &&
        comps.some((s) => s === "no" || (my === "yes" && s === "partial"))
      );
    }).length,
    gap: features.filter((f) => {
      const my = f.scores[myProduct];
      const comps = competitors.map((p) => f.scores[p]);
      return (my === "no" || my === "partial") && comps.some((s) => s === "yes");
    }).length,
    baseline: features.filter((f) => products.every((p) => f.scores[p] === "yes")).length
  };

  const filterColors: Record<FilterMode, string> = {
    all: "bg-white/10 text-foreground ring-1 ring-white/20",
    advantage: "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/25",
    gap: "bg-rose-400/15 text-rose-200 ring-1 ring-rose-400/25",
    baseline: "bg-cyan-300/12 text-cyan-100 ring-1 ring-cyan-300/20"
  };

  const inactiveColors: Record<FilterMode, string> = {
    all: "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
    advantage: "bg-white/5 text-muted-foreground hover:bg-emerald-400/10 hover:text-emerald-200",
    gap: "bg-white/5 text-muted-foreground hover:bg-rose-400/10 hover:text-rose-200",
    baseline: "bg-white/5 text-muted-foreground hover:bg-cyan-300/8 hover:text-cyan-100"
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>功能矩阵</CardTitle>
            {filter !== "all" && (
              <p className="mt-1 text-xs text-muted-foreground">
                {filterTabs.find((t) => t.id === filter)?.desc}，共 {filteredFeatures.length} 项
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs transition ${
                  filter === tab.id ? filterColors[tab.id] : inactiveColors[tab.id]
                }`}
              >
                {tab.label}
                <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
                  {counts[tab.id]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {filteredFeatures.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            当前筛选条件下无匹配功能。
          </div>
        ) : (
          <div className="min-w-[760px]">
            <div
              className="grid gap-px rounded-2xl bg-border/60 p-px"
              style={{
                gridTemplateColumns: `minmax(180px,1.2fr) minmax(140px,0.8fr) repeat(${products.length}, minmax(120px, 1fr))`
              }}
            >
              <div className="bg-slate-950/90 px-4 py-3 text-sm font-medium text-muted-foreground">功能维度</div>
              <div className="bg-slate-950/90 px-4 py-3 text-sm font-medium text-muted-foreground">分类</div>
              {products.map((product, idx) => (
                <div
                  key={product}
                  className={`bg-slate-950/90 px-4 py-3 text-sm font-medium ${
                    idx === 0 ? "text-cyan-100" : "text-muted-foreground"
                  }`}
                >
                  {product}
                  {idx === 0 && <span className="ml-1 text-[10px] text-cyan-300/70">我方</span>}
                </div>
              ))}

              {filteredFeatures.map((feature) => {
                const myScore = feature.scores[myProduct];
                const compScores = competitors.map((p) => feature.scores[p]);
                const isAdvantage =
                  filter !== "gap" &&
                  (myScore === "yes" || myScore === "partial") &&
                  compScores.some((s) => s === "no" || (myScore === "yes" && s === "partial"));
                const isGap =
                  filter !== "advantage" &&
                  (myScore === "no" || myScore === "partial") &&
                  compScores.some((s) => s === "yes");

                const rowHighlight = isAdvantage
                  ? "bg-emerald-400/5"
                  : isGap
                  ? "bg-rose-400/5"
                  : "bg-card/90";

                return (
                  <Fragment key={feature.name}>
                    <div className={`px-4 py-3 text-sm text-foreground ${rowHighlight}`}>
                      {feature.name}
                    </div>
                    <div className={`px-4 py-3 text-sm text-muted-foreground ${rowHighlight}`}>
                      {feature.category}
                    </div>
                    {products.map((product) => {
                      const score = feature.scores[product];
                      const meta = scoreMeta[score];
                      const Icon = meta.icon;
                      return (
                        <div
                          key={`${feature.name}-${product}`}
                          className={`flex items-center gap-2 px-4 py-3 text-sm ${rowHighlight}`}
                        >
                          <Icon className={`h-4 w-4 ${meta.className}`} />
                          <span className="text-foreground/90">{meta.label}</span>
                        </div>
                      );
                    })}
                  </Fragment>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
