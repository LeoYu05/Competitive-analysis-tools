import { z } from "zod";

export const RADAR_DIMENSIONS = [
  "产品体验",
  "AI能力",
  "生态整合",
  "价格竞争力",
  "移动端",
  "企业服务"
] as const;

export const featureScoreSchema = z.enum(["yes", "partial", "no"]);

export const analysisInputSchema = z.object({
  myProduct: z.string().trim().min(1, "请输入我方产品名称"),
  category: z.string().trim().min(1, "请输入产品类别"),
  myDesc: z.string().trim().max(1200).optional().default(""),
  comp1: z.string().trim().min(1, "请输入至少 2 个竞品名称"),
  comp2: z.string().trim().min(1, "请输入至少 2 个竞品名称"),
  comp3: z.string().trim().optional().default("")
});

export const analysisResultSchema = z.object({
  overview: z.object({
    market_size: z.string().min(1),
    competition_intensity: z.string().min(1),
    our_position: z.string().min(1),
    key_insight: z.string().min(1),
    stats: z
      .array(
        z.object({
          value: z.string().min(1),
          label: z.string().min(1)
        })
      )
      .length(3)
  }),
  radar: z.object({
    dimensions: z
      .array(z.string().min(1))
      .length(RADAR_DIMENSIONS.length)
      .refine(
        (dims) =>
          dims.every((dimension, index) => dimension === RADAR_DIMENSIONS[index]),
        "雷达图维度不符合约束"
      ),
    scores: z.record(
      z.string(),
      z.array(z.number().min(1).max(10)).length(RADAR_DIMENSIONS.length)
    )
  }),
  features: z.array(
    z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      scores: z.record(z.string(), featureScoreSchema)
    })
  ).min(8).max(10),
  swot: z.object({
    strengths: z.array(z.string().min(1)).min(3),
    weaknesses: z.array(z.string().min(1)).min(3),
    opportunities: z.array(z.string().min(1)).min(3),
    threats: z.array(z.string().min(1)).min(3)
  }),
  opportunities: z.array(
    z.object({
      title: z.string().min(1),
      body: z.string().min(1),
      priority: z.enum(["high", "medium", "low"]),
      tags: z.array(z.string().min(1)).min(1)
    })
  ).min(3).max(5)
});

export type AnalysisInput = z.infer<typeof analysisInputSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type HistoryItem = {
  id: string;
  createdAt: string;
  input: AnalysisInput;
  result: AnalysisResult;
};
