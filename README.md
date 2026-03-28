# CompeteIQ

基于 Next.js 的 AI 竞品分析工具。输入我方产品与竞品信息，服务端调用大模型，实时流式生成结构化分析报告。

## 分析结果包含

- **市场概览** — 市场规模、竞争烈度、我方定位、核心洞察，含 3 个关键指标卡
- **雷达图对比** — 6 维度多产品雷达图 + 综合排名（附总分、均分与进度条）
- **功能矩阵** — 8–10 项功能对比，支持筛选"我的优势"/"待补强"/"标准配置"
- **SWOT 分析** — 四象限各 3 条以上，支持一键复制全部
- **战略机会点** — 5–7 条优先级标注的机会点，支持按优先级筛选、单条复制

## 功能列表

**分析与输出**
- 服务端调用模型接口，API Key 不暴露到前端
- SSE 流式响应，实时推送处理阶段状态到客户端
- 对模型输出做 JSON 提取、解析、归一化和兜底补全
- 支持 OpenAI 兼容协议（Together、DeepSeek 等）和 Anthropic 原生 API

**交互功能**
- 概览核心洞察一键复制
- 机会点逐条复制（含标题、优先级、标签、正文、来源链接）
- SWOT 一键复制全部（Markdown 格式）
- 功能矩阵差距筛选：全部 / 我的优势 / 待补强 / 标准配置
- 机会点优先级筛选：全部 / HIGH / MEDIUM / LOW
- 错误后可一键重新分析（使用原参数）

**数据管理**
- 浏览器本地保存最近 10 次分析历史
- 支持单条删除和清空全部历史记录
- 从历史记录恢复输入参数和结果

**导出**
- 导出 JSON（原始数据）
- 导出 Markdown（格式化报告）
- 打印 / PDF（调用浏览器打印，含专用 print CSS）

**限流**
- 基于内存的 IP 限流，默认 10 分钟 6 次

## 技术栈

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Zod
- Recharts
- Lucide React
- 自定义轻量 UI 组件（基于 Radix UI Slot）

## 项目结构

```text
app/
  api/analyze/route.ts     分析接口（SSE 流式响应）
  layout.tsx               页面布局
  page.tsx                 主页面：标题、表单、历史记录、错误重试
  globals.css              全局样式与 @media print 规则

components/
  analysis-form.tsx        分析表单
  results-tabs.tsx         结果标签页（含打印、导出按钮）
  overview-panel.tsx       市场概览与产品信息（含核心洞察复制）
  radar-panel.tsx          雷达图 + 综合排名 + 评分明细
  features-panel.tsx       功能矩阵（含差距筛选）
  swot-panel.tsx           SWOT（含一键复制全部）
  opportunities-panel.tsx  机会点（含优先级筛选和逐条复制）

lib/
  ai.ts                    模型调用与 provider 抽象（OpenAI / Anthropic）
  prompt.ts                提示词构造
  parser.ts                模型输出解析与修正
  types.ts                 Zod schema 与类型定义
  utils.ts                 导出、格式化等工具函数
```

## 环境变量

在项目根目录创建 `.env.local`。

**使用 OpenAI 兼容接口（Together、官方 OpenAI 等）：**

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.together.xyz/v1
OPENAI_MODEL=openai/gpt-oss-120b
```

**使用 Anthropic 原生接口：**

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-sonnet-4-6
```

说明：
- `AI_PROVIDER=openai` 表示使用 OpenAI 兼容协议，不代表必须接 OpenAI 官方服务
- `OPENAI_BASE_URL` 和 `OPENAI_MODEL` 可按需替换，适配不同兼容网关
- `ANTHROPIC_MODEL` 默认为 `claude-sonnet-4-6`，可替换为其他 Claude 模型

## 本地运行

```bash
# 安装依赖
npm install

# 配置 .env.local（见上方环境变量说明）

# 启动开发环境
npm run dev
```

打开 `http://localhost:3000`

## 构建与启动

```bash
npm run build
npm run start
```

## API

### `POST /api/analyze`

**请求体字段：**

| 字段 | 是否必填 | 说明 |
|------|----------|------|
| `myProduct` | 必填 | 我方产品名称 |
| `category` | 必填 | 我方产品类别 |
| `myDesc` | 可选 | 我方产品描述，最长 1200 字符 |
| `comp1` | 必填 | 竞品 1 名称 |
| `comp1Category` | 可选 | 竞品 1 产品类别 |
| `comp1Desc` | 可选 | 竞品 1 产品描述 |
| `comp2` | 必填 | 竞品 2 名称 |
| `comp2Category` | 可选 | 竞品 2 产品类别 |
| `comp2Desc` | 可选 | 竞品 2 产品描述 |
| `comp3` | 可选 | 竞品 3 名称 |
| `comp3Category` | 可选 | 竞品 3 产品类别 |
| `comp3Desc` | 可选 | 竞品 3 产品描述 |

**请求示例：**

```json
{
  "myProduct": "CompeteIQ",
  "category": "AI 竞品分析平台",
  "myDesc": "面向产品经理和增长团队，自动生成结构化竞品分析报告。",
  "comp1": "Crayon",
  "comp1Category": "竞争情报平台",
  "comp1Desc": "面向销售与市场团队的竞争情报平台。",
  "comp2": "Kompyte",
  "comp2Category": "销售赋能与竞品监测平台",
  "comp2Desc": "强调自动化竞品追踪与销售赋能。",
  "comp3": "Klue",
  "comp3Category": "企业级竞争赋能平台",
  "comp3Desc": "覆盖情报收集、分发、分析与销售场景落地。"
}
```

**响应格式（SSE 流）：**

请求验证通过后，接口返回 `Content-Type: text/event-stream` 的 SSE 流，包含以下事件类型：

```
data: {"type":"phase","message":"正在调用 AI 引擎..."}

data: {"type":"phase","message":"正在解析分析结果..."}

data: {"type":"result","data":{...analysisResult}}

data: {"type":"error","message":"错误描述"}
```

- `phase`：阶段状态消息，可直接展示给用户
- `result`：分析完成，`data` 为完整结构化结果
- `error`：分析失败，`message` 为错误描述

`result.data` 结构：

```json
{
  "overview": {
    "market_size": "string",
    "competition_intensity": "string",
    "our_position": "string",
    "key_insight": "string",
    "stats": [
      { "value": "string", "label": "string" },
      { "value": "string", "label": "string" },
      { "value": "string", "label": "string" }
    ]
  },
  "radar": {
    "dimensions": ["产品体验", "AI能力", "生态整合", "价格竞争力", "移动端", "企业服务"],
    "scores": {
      "CompeteIQ": [8, 9, 7, 6, 5, 8],
      "Crayon": [7, 6, 8, 5, 4, 8]
    }
  },
  "features": [
    {
      "name": "功能名称",
      "category": "功能分类",
      "scores": { "CompeteIQ": "yes", "Crayon": "partial", "Kompyte": "no" }
    }
  ],
  "swot": {
    "strengths": ["...", "...", "..."],
    "weaknesses": ["...", "...", "..."],
    "opportunities": ["...", "...", "..."],
    "threats": ["...", "...", "..."]
  },
  "opportunities": [
    {
      "title": "string",
      "body": "string",
      "priority": "high",
      "tags": ["tag1", "tag2"],
      "source_title": "string",
      "source_url": "https://example.com"
    }
  ]
}
```

**前置校验失败时返回 JSON 错误：**

```json
{ "success": false, "error": "错误描述" }
```

常见状态码：

| 状态码 | 说明 |
|--------|------|
| `400` | 请求体格式错误或参数校验失败 |
| `429` | 请求频率过高 |
| `200` | 返回 SSE 流（含 `result` 或 `error` 事件） |

上游 AI 错误（`429 / 502 / 503 / 504`）通过 SSE `error` 事件返回，不影响 HTTP 状态码。

## 模型调用说明

`lib/ai.ts` 实现了两个 provider：

| Provider | 环境变量 | 状态 |
|----------|----------|------|
| `openai` | `OPENAI_API_KEY` + `OPENAI_BASE_URL` + `OPENAI_MODEL` | 已实现 |
| `anthropic` | `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL` | 已实现 |

两个 provider 均支持：
- 对 `429 / 502 / 503 / 504` 做指数退避重试（最多 2 次）
- 将上游错误转换为统一的 `AIProviderError`

## 数据处理说明

`lib/parser.ts` 对模型返回结果做容错处理：

- 自动去除 markdown code fence
- 从混合文本中提取 JSON 对象
- 规范化 `yes / partial / no`
- 补齐缺失的统计项、功能项、SWOT 项、机会点
- 限制数组长度，确保前端可渲染

即使模型返回的 JSON 质量一般，接口也会尽量给出可展示结果。

## 注意事项

- 当前限流使用内存 `Map`，仅适合单实例场景；多实例部署时限流状态不会共享
- API Key 只应保存在服务端环境变量中，不应提交到代码仓库
- `.env.local` 和 `.next/` 均不应作为项目源码提交

## 部署

项目可直接部署到 Vercel：

1. 推送代码到 GitHub
2. 在 Vercel 导入仓库
3. 在 Vercel 项目设置中配置环境变量
4. 部署

多实例环境下建议引入 Redis（如 Upstash）替换内存限流。
