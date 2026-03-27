import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { AIProviderError, generateStructuredAnalysis } from "@/lib/ai";
import { parseAnalysisResponse } from "@/lib/parser";
import { buildAnalysisPrompt } from "@/lib/prompt";
import { analysisInputSchema, type ApiError, type ApiSuccess } from "@/lib/types";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 6;

const rateLimitStore = new Map<string, number[]>();

function mapAIProviderStatus(status: number) {
  if (status === 429) {
    return {
      status: 429,
      message: "AI 服务当前请求过多，请稍后再试。"
    };
  }

  if (status === 502 || status === 503 || status === 504) {
    return {
      status: 503,
      message: "AI 服务暂时不可用，请稍后重试。"
    };
  }

  return {
    status: 502,
    message: "AI 服务请求失败，请稍后重试。"
  };
}

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = rateLimitStore.get(ip) ?? [];
  const validTimestamps = timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (validTimestamps.length >= LIMIT) {
    rateLimitStore.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitStore.set(ip, validTimestamps);
  return false;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json<ApiError>(
      {
        success: false,
        error: "请求过于频繁，请稍后再试。"
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const input = analysisInputSchema.parse(body);
    const prompt = buildAnalysisPrompt(input);
    const aiResponse = await generateStructuredAnalysis(prompt);
    const result = parseAnalysisResponse(input, aiResponse.text);

    return NextResponse.json<ApiSuccess<typeof result>>({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("[/api/analyze]", error);

    if (error instanceof ZodError) {
      return NextResponse.json<ApiError>(
        {
          success: false,
          error: error.issues[0]?.message || "请求参数不完整，请检查输入。"
        },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json<ApiError>(
        {
          success: false,
          error: "请求体格式错误，请检查提交内容。"
        },
        { status: 400 }
      );
    }

    if (error instanceof AIProviderError) {
      const mapped = mapAIProviderStatus(error.status);

      return NextResponse.json<ApiError>(
        {
          success: false,
          error: mapped.message
        },
        { status: mapped.status }
      );
    }

    const message =
      error instanceof Error
        ? error.message.includes("JSON") || error.message.includes("非 JSON")
          ? "模型返回格式异常，请稍后重试。"
          : error.message
        : "服务端发生未知异常，请稍后重试。";

    return NextResponse.json<ApiError>(
      {
        success: false,
        error: message || "分析失败，请稍后重试。"
      },
      { status: 500 }
    );
  }
}
