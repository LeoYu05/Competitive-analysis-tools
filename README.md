# CompeteIQ

CompeteIQ 是一个 AI 竞品分析 Web 应用。输入我方产品、产品类别、可选产品描述，以及 2 到 3 个竞品名称后，系统会生成结构化分析结果，包括概览、雷达图、功能矩阵、SWOT 和机会点。

## 技术栈

- Next.js App Router
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui 风格组件
- Recharts
- Zod
- Next.js Route Handlers

## 核心能力

- 服务端调用模型接口，不暴露 API Key
- Zod 校验输入与输出
- 自动清理 markdown code fence，并从模型返回内容中提取 JSON
- 对模型返回结果做归一化和兜底补全，保证前端可渲染
- 浏览器本地保存最近 6 次分析
- 支持导出 JSON 和 Markdown
- 基于内存的 IP 限流

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 创建环境变量文件

在项目根目录新建 `.env.local`

3. 在 `.env.local` 中填写

```env
OPENAI_API_KEY=your_together_api_key
OPENAI_BASE_URL=https://api.together.xyz/v1
OPENAI_MODEL=zai-org/GLM-5
AI_PROVIDER=openai
```

说明：

- 当前项目实际可用的是 `openai` provider，并通过 OpenAI 兼容接口调用模型

4. 启动开发环境

```bash
npm run dev
```

5. 打开浏览器访问 `http://localhost:3000`

## 线上部署到 Vercel

1. 将项目推送到 GitHub。
2. 在 Vercel 中导入该仓库。
3. 在 Vercel 项目设置中添加以下环境变量：

```env
OPENAI_API_KEY=your_together_api_key
OPENAI_BASE_URL=https://api.together.xyz/v1
OPENAI_MODEL=zai-org/GLM-5
AI_PROVIDER=openai
```
4. 执行部署。Vercel 会自动运行 `npm install` 和 `npm run build`。
5. 部署完成后即可使用。

## API 说明

### `POST /api/analyze`

请求体字段：

- `myProduct`: 必填，我方产品名称
- `category`: 必填，产品类别
- `myDesc`: 可选，产品描述，最长 1200 字符
- `comp1`: 必填，竞品 1
- `comp2`: 必填，竞品 2
- `comp3`: 可选，竞品 3

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

说明：

- 成功时 `data` 为结构化分析结果，包含 `overview`、`radar`、`features`、`swot`、`opportunities`
- 服务端会尝试清理和修正模型输出，例如补齐缺失项、限制数组长度、规范 `yes / partial / no`

失败响应：

```json
{
  "success": false,
  "error": "错误描述"
}
```

常见状态码：

- `400`: 请求体格式错误或参数校验失败
- `429`: 同一 IP 在 10 分钟内超过 6 次请求
- `500`: 模型调用失败或服务端处理异常

## Provider 支持状态

当前 `lib/ai.ts` 中有 provider 抽象层，但实际状态如下：

- `openai`: 已实现，可用于 OpenAI 兼容接口
- `anthropic`: 仅保留占位类，当前会直接报错，尚未接入实际 API

如果要真正切换到 Anthropic，需要至少完成以下修改：

1. 在 `lib/ai.ts` 中实现 `AnthropicProvider.generateText()` 的实际请求逻辑。
2. 新增并读取对应环境变量，例如：

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-sonnet-4-0
AI_PROVIDER=anthropic
```

3. 根据 Anthropic 接口格式适配返回内容。
4. 完成后再将 `AI_PROVIDER` 切换为 `anthropic`。

## 当前默认模型配置

当前项目的本地环境变量配置为通过 Together 的 OpenAI 兼容接口调用 `zai-org/GLM-5`：

```env
OPENAI_API_KEY=your_together_api_key
OPENAI_BASE_URL=https://api.together.xyz/v1
OPENAI_MODEL=zai-org/GLM-5
AI_PROVIDER=openai
```

如果后续切换到其他 OpenAI 兼容网关，只需要调整 `OPENAI_BASE_URL` 和 `OPENAI_MODEL`。

## 注意事项

- API Key 只在服务端读取，不会暴露到前端。
- 当前限流为内存实现，适合单实例基础防护；在无状态多实例部署下不会共享限流状态。
- 若模型返回带 markdown code fence 或前后夹杂说明文本，服务端会自动提取 JSON 对象后再解析。
- 若模型输出不完整，服务端会为部分字段补默认值，以保证页面可以正常展示。
