# CompeteIQ

CompeteIQ 是一个 AI 竞品分析 Web 应用。输入我方产品、产品类别、产品描述和最多 3 个竞品名称后，系统会生成结构化分析结果，包括概览、雷达图、功能矩阵、SWOT 和机会点。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui 风格组件
- Recharts
- Zod
- Next.js Route Handlers

## 核心能力

- 服务端调用模型接口，不暴露 API Key
- Zod 校验输入与输出
- 自动清理并解析模型返回的 JSON
- 浏览器本地保存最近 6 次分析
- 支持导出 JSON 和 Markdown
- 内存限流

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 创建环境变量文件

```bash
cp .env.example .env.local
```

3. 在 `.env.local` 中填写

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1
AI_PROVIDER=openai
```

4. 启动开发环境

```bash
npm run dev
```

5. 打开浏览器访问 `http://localhost:3000`

## 线上部署到 Vercel

1. 将项目推送到 GitHub。
2. 在 Vercel 中导入该仓库。
3. 在 Vercel 项目设置中添加环境变量：
   - `OPENAI_API_KEY`
   - `OPENAI_BASE_URL`
   - `OPENAI_MODEL`
   - `AI_PROVIDER`
4. 执行部署。Vercel 会自动运行 `npm install` 和 `npm run build`。
5. 部署完成后即可使用。

## API 说明

### `POST /api/analyze`

请求体：

```json
{
  "myProduct": "CompeteIQ",
  "category": "AI 竞品分析平台",
  "myDesc": "面向产品经理和增长团队，自动生成竞品分析报告。",
  "comp1": "Crayon",
  "comp2": "Kompyte",
  "comp3": "Klue"
}
```

成功响应：

```json
{
  "success": true,
  "data": {}
}
```

失败响应：

```json
{
  "success": false,
  "error": "错误描述"
}
```

## 切换到 Anthropic

当前 `lib/ai.ts` 已预留 provider 抽象层。

切换步骤：

1. 在 `lib/ai.ts` 中实现 `AnthropicProvider.generateText()`。
2. 新增环境变量，例如：

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-sonnet-4-0
AI_PROVIDER=anthropic
```

3. 在 `getProvider()` 中读取 `AI_PROVIDER=anthropic` 并返回 `AnthropicProvider`。
4. 其余业务层不需要修改，因为 API 路由只依赖统一的 `generateStructuredAnalysis()`。

## 使用 Z.AI / GLM-5

如果使用 OpenAI 兼容接口，可直接替换基础地址和模型名：

```env
OPENAI_BASE_URL=https://api.z.ai/api/paas/v4
```

示例：

```env
OPENAI_API_KEY=your_zai_api_key
OPENAI_BASE_URL=https://api.z.ai/api/paas/v4
OPENAI_MODEL=glm-5
AI_PROVIDER=openai
```

如果接入的是第三方网关，模型名可能不同，按网关文档填写即可。

## 注意事项

- API Key 只在服务端读取，不会暴露到前端。
- 当前限流为内存实现，适合单实例基础防护；线上可替换为 Upstash Redis 等持久化方案。
- 若模型返回非 JSON 或带 markdown code fence，服务端会自动清理并尝试解析。
