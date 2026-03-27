"use client";

import { useState } from "react";
import { Download, FileJson, LayoutDashboard, ListChecks, Orbit, ShieldAlert, Target } from "lucide-react";

import { FeaturesPanel } from "@/components/features-panel";
import { OpportunitiesPanel } from "@/components/opportunities-panel";
import { OverviewPanel } from "@/components/overview-panel";
import { RadarPanel } from "@/components/radar-panel";
import { SwotPanel } from "@/components/swot-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalysisInput, AnalysisResult } from "@/lib/types";

type ResultsTabsProps = {
  input: AnalysisInput | null;
  result: AnalysisResult | null;
  isLoading: boolean;
  onExportJson: () => void;
  onExportMarkdown: () => void;
};

const tabs = [
  { id: "overview", label: "概览", icon: LayoutDashboard },
  { id: "radar", label: "雷达图", icon: Orbit },
  { id: "features", label: "功能矩阵", icon: ListChecks },
  { id: "swot", label: "SWOT", icon: ShieldAlert },
  { id: "opportunities", label: "机会点", icon: Target }
] as const;

export function ResultsTabs({
  input,
  result,
  isLoading,
  onExportJson,
  onExportMarkdown
}: ResultsTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="h-7 w-40 animate-pulse rounded-xl bg-white/10" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-36 animate-pulse rounded-2xl bg-white/10" />
            <div className="h-36 animate-pulse rounded-2xl bg-white/10" />
          </div>
          <div className="h-[320px] animate-pulse rounded-2xl bg-white/10" />
        </CardContent>
      </Card>
    );
  }

  if (!result || !input) {
    return (
      <Card>
        <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 p-4 text-cyan-100">
            <Orbit className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">等待生成分析报告</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              填写左侧信息后，系统会生成概览、雷达图、功能矩阵、SWOT 和战略机会点。
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
                    isActive
                      ? "bg-cyan-300/12 text-cyan-100 ring-1 ring-cyan-300/20"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onExportJson}>
              <FileJson className="h-4 w-4" />
              导出 JSON
            </Button>
            <Button variant="outline" onClick={onExportMarkdown}>
              <Download className="h-4 w-4" />
              导出 Markdown
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeTab === "overview" ? <OverviewPanel input={input} overview={result.overview} /> : null}
      {activeTab === "radar" ? <RadarPanel radar={result.radar} /> : null}
      {activeTab === "features" ? <FeaturesPanel features={result.features} /> : null}
      {activeTab === "swot" ? <SwotPanel swot={result.swot} /> : null}
      {activeTab === "opportunities" ? <OpportunitiesPanel opportunities={result.opportunities} /> : null}
    </div>
  );
}
