"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/types";

type SwotPanelProps = {
  swot: AnalysisResult["swot"];
};

const sections = [
  { key: "strengths", title: "Strengths", className: "border-emerald-400/20 bg-emerald-400/8" },
  { key: "weaknesses", title: "Weaknesses", className: "border-amber-400/20 bg-amber-400/8" },
  { key: "opportunities", title: "Opportunities", className: "border-cyan-400/20 bg-cyan-400/8" },
  { key: "threats", title: "Threats", className: "border-rose-400/20 bg-rose-400/8" }
] as const;

export function SwotPanel({ swot }: SwotPanelProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyAll() {
    const text = sections
      .map(
        (s) =>
          `## ${s.title}\n${swot[s.key].map((item) => `- ${item}`).join("\n")}`
      )
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleCopyAll}>
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          {copied ? "已复制" : "复制全部 SWOT"}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.key} className={section.className}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-foreground/90">
                {swot[section.key].map((item, index) => (
                  <li
                    key={`${section.key}-${index}`}
                    className="rounded-xl border border-white/8 bg-black/10 px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
