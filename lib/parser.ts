import { z } from "zod";

import {
  analysisResultSchema,
  RADAR_DIMENSIONS,
  type AnalysisInput,
  type AnalysisResult
} from "@/lib/types";
import { buildCompetitorList } from "@/lib/utils";

function stripMarkdownFence(raw: string) {
  const trimmed = raw.trim();

  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  return trimmed;
}

function extractJSONObject(raw: string) {
  const cleaned = stripMarkdownFence(raw);
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("模型未返回可识别的 JSON 对象");
  }

  return cleaned.slice(start, end + 1);
}

function normalizeScoreValue(value: unknown) {
  if (value === "yes" || value === "partial" || value === "no") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized.includes("yes") || normalized.includes("支持")) return "yes";
    if (normalized.includes("partial") || normalized.includes("部分")) return "partial";
  }

  return "no";
}

function normalizeUrl(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function normalizeAnalysisResult(input: AnalysisInput, payload: unknown): AnalysisResult {
  const recordSchema = z.record(z.string(), z.unknown());
  const parsedRecord = recordSchema.parse(payload);
  const products = buildCompetitorList(input);

  const overviewSource = z.record(z.string(), z.unknown()).catch({}).parse(parsedRecord.overview);
  const radarSource = z.record(z.string(), z.unknown()).catch({}).parse(parsedRecord.radar);
  const swotSource = z.record(z.string(), z.unknown()).catch({}).parse(parsedRecord.swot);

  const normalized: AnalysisResult = {
    overview: {
      market_size: String(overviewSource.market_size ?? "市场仍在快速增长"),
      competition_intensity: String(overviewSource.competition_intensity ?? "中高竞争"),
      our_position: String(overviewSource.our_position ?? "聚焦差异化切入"),
      key_insight: String(overviewSource.key_insight ?? "AI 能力与场景落地将决定竞争优势"),
      stats: z
        .array(z.record(z.string(), z.unknown()))
        .catch([])
        .parse(overviewSource.stats)
        .slice(0, 3)
        .map((item, index) => ({
          value: String(item.value ?? `${index + 1}`),
          label: String(item.label ?? `指标 ${index + 1}`)
        }))
    },
    radar: {
      dimensions: [...RADAR_DIMENSIONS],
      scores: {}
    },
    features: z
      .array(z.record(z.string(), z.unknown()))
      .catch([])
      .parse(parsedRecord.features)
      .slice(0, 10)
      .map((feature, index) => {
        const scoreSource = z.record(z.string(), z.unknown()).catch({}).parse(feature.scores);
        const scores: AnalysisResult["features"][number]["scores"] = Object.fromEntries(
          products.map((product) => [product, normalizeScoreValue(scoreSource[product])])
        ) as AnalysisResult["features"][number]["scores"];

        return {
          name: String(feature.name ?? `功能维度 ${index + 1}`),
          category: String(feature.category ?? "核心能力"),
          scores
        };
      }),
    swot: {
      strengths: z.array(z.string()).catch([]).parse(swotSource.strengths).slice(0, 5),
      weaknesses: z.array(z.string()).catch([]).parse(swotSource.weaknesses).slice(0, 5),
      opportunities: z.array(z.string()).catch([]).parse(swotSource.opportunities).slice(0, 5),
      threats: z.array(z.string()).catch([]).parse(swotSource.threats).slice(0, 5)
    },
    opportunities: z
      .array(z.record(z.string(), z.unknown()))
      .catch([])
      .parse(parsedRecord.opportunities)
      .slice(0, 7)
      .map((item, index) => ({
        title: String(item.title ?? `机会点 ${index + 1}`),
        body: String(item.body ?? "建议进一步补充策略描述"),
        priority:
          item.priority === "high" || item.priority === "medium" || item.priority === "low"
            ? item.priority
            : "medium",
        tags: z.array(z.string()).catch([]).parse(item.tags).slice(0, 4),
        source_title: String(item.source_title ?? ""),
        source_url: normalizeUrl(item.source_url)
      }))
  };

  const radarScores = z.record(z.string(), z.array(z.number()).catch([])).catch({}).parse(radarSource.scores);
  for (const product of products) {
    const existing = radarScores[product] ?? [];
    normalized.radar.scores[product] = RADAR_DIMENSIONS.map((_, index) => {
      const value = Number(existing[index]);
      if (Number.isFinite(value)) {
        return Math.min(10, Math.max(1, Math.round(value)));
      }
      return 5;
    });
  }

  while (normalized.overview.stats.length < 3) {
    normalized.overview.stats.push({
      value: "待补充",
      label: `指标 ${normalized.overview.stats.length + 1}`
    });
  }

  while (normalized.features.length < 8) {
    normalized.features.push({
      name: `功能维度 ${normalized.features.length + 1}`,
      category: "核心能力",
      scores: Object.fromEntries(products.map((product) => [product, "partial"])) as AnalysisResult["features"][number]["scores"]
    });
  }

  for (const key of ["strengths", "weaknesses", "opportunities", "threats"] as const) {
    while (normalized.swot[key].length < 3) {
      normalized.swot[key].push("待补充");
    }
  }

  while (normalized.opportunities.length < 5) {
    normalized.opportunities.push({
      title: `机会点 ${normalized.opportunities.length + 1}`,
      body: "建议结合市场细分场景进一步挖掘差异化策略。",
      priority: "medium",
      tags: ["策略", "待细化"],
      source_title: "",
      source_url: ""
    });
  }

  return analysisResultSchema.parse(normalized);
}

export function parseAnalysisResponse(input: AnalysisInput, rawText: string) {
  const jsonText = extractJSONObject(rawText);
  let payload: unknown;

  try {
    payload = JSON.parse(jsonText) as unknown;
  } catch {
    throw new Error("模型返回非 JSON");
  }

  return normalizeAnalysisResult(input, payload);
}
