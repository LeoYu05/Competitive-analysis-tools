import type { AnalysisInput } from "@/lib/types";
import { RADAR_DIMENSIONS } from "@/lib/types";
import { buildCompetitorList } from "@/lib/utils";

export function buildAnalysisPrompt(input: AnalysisInput) {
  const competitors = buildCompetitorList(input);

  return `你是资深战略分析师与 SaaS 产品顾问。请基于输入信息，输出一份中文竞品分析结果。

严格要求：
1. 只返回 JSON，不要 markdown，不要代码块，不要额外解释。
2. 所有字段都必须填写。
3. radar.dimensions 必须严格等于：${JSON.stringify(RADAR_DIMENSIONS)}。
4. radar.scores 中每个产品的分数数组长度必须与 dimensions 一致，范围 1-10。
5. features 必须返回 8 到 10 条。
6. opportunities 必须返回 3 到 5 条。
7. stats 必须恰好 3 条。
8. SWOT 四个字段每个至少 3 条。
9. features.scores 的取值只能是 yes / partial / no。
10. 请结合品类常识、竞品定位、用户群体和 AI 能力成熟度进行合理分析。

输入信息：
- 我方产品：${input.myProduct}
- 产品类别：${input.category}
- 产品描述：${input.myDesc || "未提供"}
- 竞品列表：${competitors.slice(1).join("、")}

你必须严格输出以下 JSON 结构：
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
    "dimensions": ${JSON.stringify(RADAR_DIMENSIONS)},
    "scores": {
      "${input.myProduct}": [1,2,3,4,5,6]
    }
  },
  "features": [
    {
      "name": "功能名称",
      "category": "功能分类",
      "scores": {
        "${input.myProduct}": "yes"
      }
    }
  ],
  "swot": {
    "strengths": ["", "", ""],
    "weaknesses": ["", "", ""],
    "opportunities": ["", "", ""],
    "threats": ["", "", ""]
  },
  "opportunities": [
    {
      "title": "string",
      "body": "string",
      "priority": "high",
      "tags": ["tag1", "tag2"]
    }
  ]
}`;
}
