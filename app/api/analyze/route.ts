import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { AIProviderError, generateStructuredAnalysis } from "@/lib/ai";
import { parseAnalysisResponse } from "@/lib/parser";
import { buildAnalysisPrompt } from "@/lib/prompt";
import { analysisInputSchema, type AnalysisResult, type ApiError } from "@/lib/types";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 6;

const rateLimitStore = new Map<string, number[]>();

type SSEEvent =
  | { type: "phase"; message: string }
  | { type: "result"; data: AnalysisResult }
  | { type: "error"; message: string };

function mapAIProviderStatus(status: number) {
  if (status === 429) {
    return { status: 429, message: "AI 服务当前请求过多，请稍后再试。" };
  }
  if (status === 502 || status === 503 || status === 504) {
    return { status: 503, message: "AI 服务暂时不可用，请稍后重试。" };
  }
  return { status: 502, message: "AI 服务请求失败，请稍后重试。" };
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
      { success: false, error: "请求过于频繁，请稍后再试。" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { success: false, error: "请求体格式错误，请检查提交内容。" },
      { status: 400 }
    );
  }

  let input: ReturnType<typeof analysisInputSchema.parse>;
  try {
    input = analysisInputSchema.parse(body);
  } catch (error) {
    const message =
      error instanceof ZodError
        ? error.issues[0]?.message || "请求参数不完整，请检查输入。"
        : "请求参数无效。";
    return NextResponse.json<ApiError>({ success: false, error: message }, { status: 400 });
  }

  const prompt = buildAnalysisPrompt(input);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SSEEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        send({ type: "phase", message: "正在调用 AI 引擎..." });
        const aiResponse = await generateStructuredAnalysis(prompt);

        send({ type: "phase", message: "正在解析分析结果..." });
        const result = parseAnalysisResponse(input, aiResponse.text);

        send({ type: "result", data: result });
      } catch (error) {
        console.error("[/api/analyze]", error);

        if (error instanceof AIProviderError) {
          const mapped = mapAIProviderStatus(error.status);
          send({ type: "error", message: mapped.message });
        } else {
          const message =
            error instanceof Error
              ? error.message.includes("JSON") || error.message.includes("非 JSON")
                ? "模型返回格式异常，请稍后重试。"
                : error.message
              : "服务端发生未知异常，请稍后重试。";
          send({ type: "error", message });
        }
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
