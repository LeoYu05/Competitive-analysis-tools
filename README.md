# CompeteIQ

CompeteIQ 是一个基于 Next.js 的 AI 竞品分析工具。用户输入我方产品信息，以及 2 到 3 个竞品的名称、产品类别、产品描述后，系统会通过服务端调用大模型生成结构化分析结果。

当前分析结果包含：

- 市场概览
- 多产品雷达图
- 功能矩阵
- SWOT 分析
- 战略机会点与外部参考链接

## 功能概览

- 服务端调用模型接口，API Key 不暴露到前端
- 支持填写我方产品信息与 3 个竞品的名称、产品类别、产品描述
- 对模型输出做 JSON 提取、解析、归一化和兜底补全
- 展示概览、雷达图、功能矩阵、SWOT、机会点
- 首页为单列标题区，突出核心用途，不展示顶部信息卡
- 概览页以文字分析为主，不展示伪精确的统计型数据卡
- 浏览器本地保存最近 6 次分析历史
- 支持单条删除历史记录和清空历史记录
- 支持导出 JSON 和 Markdown 报告
- 基于内存的简单 IP 限流
- 兼容 OpenAI 风格接口，可接入 Together 等兼容网关

## 技术栈

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Zod
- Recharts
- Lucide React
- 自定义轻量 UI 组件

## 项目结构

```text
app/
  api/analyze/route.ts     分析接口
  layout.tsx               页面布局
  page.tsx                 首页标题区、分析表单、历史记录
components/
  analysis-form.tsx        分析表单
  results-tabs.tsx         结果页标签切换
  overview-panel.tsx       概览正文、分析说明与产品信息展示
  radar-panel.tsx          雷达图
  features-panel.tsx       功能矩阵
  swot-panel.tsx           SWOT
  opportunities-panel.tsx  机会点与外部链接
lib/
  ai.ts                    模型调用与 provider 抽象
  prompt.ts                提示词构造
  parser.ts                模型输出解析与修正
  types.ts                 Zod schema 与类型定义
  utils.ts                 导出、格式化等工具函数
```

## 环境变量

在项目根目录创建 `.env.local`：

```env
OPENAI_API_KEY=your_together_api_key
OPENAI_BASE_URL=https://api.together.xyz/v1
OPENAI_MODEL=zai-org/GLM-5
AI_PROVIDER=openai
```

说明：

- `AI_PROVIDER=openai` 指的是使用 OpenAI 兼容协议，不代表必须接 OpenAI 官方模型
- 当前项目可直接通过 OpenAI 兼容接口调用 Together 上的 `zai-org/GLM-5`
- 如果切换到其他兼容网关，通常只需要调整 `OPENAI_BASE_URL` 和 `OPENAI_MODEL`

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 配置 `.env.local`

3. 启动开发环境

```bash
npm run dev
```

4. 打开 `http://localhost:3000`

## 构建与启动

```bash
npm run build
npm run start
```

## API

### `POST /api/analyze`

请求体字段：

- `myProduct`: 必填，我方产品名称
- `category`: 必填，我方产品类别
- `myDesc`: 可选，我方产品描述，最长 1200 字符
- `comp1`: 必填，竞品 1 名称
- `comp1Category`: 可选，竞品 1 产品类别
- `comp1Desc`: 可选，竞品 1 产品描述
- `comp2`: 必填，竞品 2 名称
- `comp2Category`: 可选，竞品 2 产品类别
- `comp2Desc`: 可选，竞品 2 产品描述
- `comp3`: 可选，竞品 3 名称
- `comp3Category`: 可选，竞品 3 产品类别
- `comp3Desc`: 可选，竞品 3 产品描述

请求示例：

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

成功响应：

```json
{
  "success": true,
  "data": {
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
    "features": [],
    "swot": {},
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
}
```

说明：

- `overview.stats` 字段在数据结构中仍会返回，但当前页面不会把它渲染成夸张的数值卡片
- `opportunities` 当前会返回 `5` 到 `7` 条
- `source_title` 与 `source_url` 用于机会点的外部支持链接展示

失败响应：

```json
{
  "success": false,
  "error": "错误描述"
}
```

常见状态码：

- `400`: 请求体格式错误或参数校验失败
- `429`: 请求频率过高
- `502`: 上游 AI 请求失败
- `503`: 上游 AI 服务暂时不可用
- `500`: 服务端内部异常

## 模型调用说明

`lib/ai.ts` 中保留了 provider 抽象层。

当前状态：

- `openai`: 已实现，用于 OpenAI 兼容接口
- `anthropic`: 仅占位，尚未接入实际请求逻辑

当前实现特性：

- 调用 `/chat/completions`
- 对 `429 / 502 / 503 / 504` 做有限重试
- 将上游错误转换为统一错误响应

## 数据处理说明

`lib/parser.ts` 会对模型返回结果做容错处理：

- 自动去除 markdown code fence
- 从混合文本中提取 JSON 对象
- 规范 `yes / partial / no`
- 补齐缺失的统计项、功能项、SWOT 项、机会点
- 限制数组长度，确保前端可渲染

这意味着即使模型返回的 JSON 质量一般，接口仍会尽量给出可展示结果。

## 页面说明

- 首页顶部为单列标题区，不再展示“服务端调用 / 结构化结果 / 本地记录”信息卡
- 概览页展示市场规模、竞争烈度、我方定位、核心洞察，以及分析范围、判断依据、解读重点
- 概览页不再把 `overview.stats` 渲染成看似精确的数字指标卡，避免误导
- 机会点页默认展示 5 到 7 条内容
- 每条机会点优先使用模型返回的外部支持链接；如果没有可信链接，则提供 Google 搜索跳转
- 产品信息区会展示我方产品和竞品的类别与产品描述，便于核对分析前提

## 历史记录说明

历史记录仅保存在浏览器本地 `localStorage` 中：

- 最多保存最近 6 条
- 支持单条删除
- 支持清空全部历史
- 不会同步到服务端

## 部署说明

项目可直接部署到 Vercel：

1. 推送代码到 GitHub
2. 在 Vercel 导入仓库
3. 配置环境变量
4. 部署

需要配置的环境变量：

```env
OPENAI_API_KEY=your_together_api_key
OPENAI_BASE_URL=https://api.together.xyz/v1
OPENAI_MODEL=zai-org/GLM-5
AI_PROVIDER=openai
```

## 注意事项

- 当前限流使用内存 `Map`，只适合单实例场景
- 多实例部署时，限流状态不会共享
- 上游模型服务不稳定时，可能出现 `502` 或 `503`
- API Key 只应保存在服务端环境变量中，不应提交到仓库
- 如果你已经泄露过 Key，应立即去供应商后台撤销并更换
- `.env.local` 和 `.next` 都不应该作为项目源码提交
