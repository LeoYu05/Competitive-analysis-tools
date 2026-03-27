import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { AnalysisInput, AnalysisResult } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildCompetitorList(input: AnalysisInput) {
  return [input.myProduct, input.comp1, input.comp2, input.comp3]
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatDateTime(dateString: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateString));
}

export function downloadTextFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function createClientId() {
  if (
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildMarkdownReport(input: AnalysisInput, result: AnalysisResult) {
  const radarRows = Object.entries(result.radar.scores)
    .map(
      ([product, scores]) =>
        `- ${product}：${result.radar.dimensions
          .map((dimension, index) => `${dimension} ${scores[index]}`)
          .join(" / ")}`
    )
    .join("\n");

  const featureRows = result.features
    .map((feature) => {
      const scoreText = Object.entries(feature.scores)
        .map(([product, score]) => `${product}: ${score}`)
        .join(" | ");
      return `- ${feature.name}（${feature.category}）: ${scoreText}`;
    })
    .join("\n");

  const opportunityRows = result.opportunities
    .map(
      (item) =>
        `### ${item.title}\n优先级：${item.priority}\n标签：${item.tags.join(" / ")}\n\n${item.body}`
    )
    .join("\n\n");

  return `# CompeteIQ 竞品分析报告

## 输入信息
- 我方产品：${input.myProduct}
- 产品类别：${input.category}
- 产品描述：${input.myDesc || "未提供"}
- 竞品：${[input.comp1, input.comp2, input.comp3].filter(Boolean).join(" / ")}

## 概览
- 市场规模：${result.overview.market_size}
- 竞争烈度：${result.overview.competition_intensity}
- 我方定位：${result.overview.our_position}
- 核心洞察：${result.overview.key_insight}

${result.overview.stats.map((item) => `- ${item.label}：${item.value}`).join("\n")}

## 雷达图评分
${radarRows}

## 功能矩阵
${featureRows}

## SWOT
### Strengths
${result.swot.strengths.map((item) => `- ${item}`).join("\n")}

### Weaknesses
${result.swot.weaknesses.map((item) => `- ${item}`).join("\n")}

### Opportunities
${result.swot.opportunities.map((item) => `- ${item}`).join("\n")}

### Threats
${result.swot.threats.map((item) => `- ${item}`).join("\n")}

## 战略机会点
${opportunityRows}
`;
}
