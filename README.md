# CompeteIQ

CompeteIQ 是一个可正式上线的 AI 竞品分析 Web 应用。用户输入我方产品、产品类别、产品描述与最多 3 个竞品名称后，系统会生成结构化竞品分析报告，包括概览、雷达图、功能矩阵、SWOT 与战略机会点。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui 风格组件
- Recharts
- Zod
- Next.js Route Handlers

## 项目结构

```text
app/
  api/analyze/route.ts
  globals.css
  icon.tsx
  layout.tsx
  page.tsx
components/
  analysis-form.tsx
  features-panel.tsx
  opportunities-panel.tsx
  overview-panel.tsx
  radar-panel.tsx
  results-tabs.tsx
  swot-panel.tsx
  ui/
    badge.tsx
    button.tsx
    card.tsx
    input.tsx
    label.tsx
    textarea.tsx
lib/
  ai.ts
  parser.ts
  prompt.ts
  types.ts
  utils.ts
styles/
  theme.css
.env.example
README.md
components.json
next-env.d.ts
package.json
postcss.config.js
tailwind.config.ts
tsconfig.json
```

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 创建环境变量：

```bash
cp .env.example .env.local
```

3. 在 `.env.local` 中填写：

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1
AI_PROVIDER=openai
```

4. 启动开发环境：

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
4. 执行部署。Vercel 会自动运行 `npm install` 与 `npm run build`。
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

## 已实现能力

- 服务端统一 AI provider 层
- Prompt Builder 独立封装
- JSON code fence 清理与解析容错
- Zod schema 校验与归一化
- 统一 API 错误结构
- 本地历史记录 localStorage
- 导出 JSON
- 导出 Markdown
- 示例数据一键填充
- 基础限流设计
- 基础 SEO metadata 与 favicon

## 切换到 Anthropic

当前 `lib/ai.ts` 已预留 provider 抽象层。

后续切换步骤：

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

根据 Z.AI 官方开发文档，Z.AI 提供 OpenAI 兼容调用方式，官方通用接口基地址是：

```env
OPENAI_BASE_URL=https://api.z.ai/api/paas/v4
```

官方文档中的模型名写法是：

```env
OPENAI_MODEL=glm-5
```

完整示例：

```env
OPENAI_API_KEY=your_zai_api_key
OPENAI_BASE_URL=https://api.z.ai/api/paas/v4
OPENAI_MODEL=glm-5
AI_PROVIDER=openai
```

如果你使用的并不是 Z.AI 官方直连接口，而是第三方网关，那么像 `zai-org/GLM-5` 这种模型名也可能成立；这取决于你接入的平台。按 Z.AI 官方文档，建议优先使用 `glm-5`。

## 注意事项

- API Key 只在服务端读取，不会暴露到前端。
- 当前限流为内存实现，适合单实例基础防护；线上可替换为 Upstash Redis 等持久化方案。
- 若模型返回非 JSON 或带 markdown code fence，服务端会自动清理并尝试解析。
