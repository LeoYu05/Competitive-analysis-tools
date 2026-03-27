type GenerateTextParams = {
  prompt: string;
};

type ProviderResponse = {
  text: string;
};

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

interface AIProvider {
  generateText(params: GenerateTextParams): Promise<ProviderResponse>;
}

export class AIProviderError extends Error {
  status: number;
  detail: string;

  constructor(message: string, status: number, detail: string) {
    super(message);
    this.name = "AIProviderError";
    this.status = status;
    this.detail = detail;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class OpenAIProvider implements AIProvider {
  async generateText({ prompt }: GenerateTextParams): Promise<ProviderResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4.1";
    const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");

    if (!apiKey) {
      throw new Error("未配置 OPENAI_API_KEY");
    }

    let lastError: AIProviderError | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          messages: [
            {
              role: "system",
              content:
                "你是严谨的竞品分析引擎。必须遵守格式要求，输出可直接 JSON.parse 的纯 JSON。"
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const detail = await response.text();
        lastError = new AIProviderError(
          `AI 服务请求失败：${response.status} ${detail}`,
          response.status,
          detail
        );

        if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * 2 ** attempt);
          continue;
        }

        throw lastError;
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | null } }>;
      };

      const text = payload.choices?.[0]?.message?.content?.trim();

      if (!text) {
        throw new Error("AI 服务未返回有效内容");
      }

      return { text };
    }

    throw lastError ?? new Error("AI 服务请求失败");
  }
}

class AnthropicProvider implements AIProvider {
  async generateText(): Promise<ProviderResponse> {
    throw new Error("Anthropic provider 尚未启用，请先实现 API 调用逻辑");
  }
}

function getProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase() || "openai";

  if (provider === "anthropic") {
    return new AnthropicProvider();
  }

  return new OpenAIProvider();
}

export async function generateStructuredAnalysis(prompt: string) {
  const provider = getProvider();
  return provider.generateText({ prompt });
}
