import type { AnalysisInput } from "@/lib/types";
import { RADAR_DIMENSIONS } from "@/lib/types";
import { buildCompetitorList } from "@/lib/utils";

export function buildAnalysisPrompt(input: AnalysisInput) {
  const competitors = buildCompetitorList(input);
  const radarScoreTemplate = competitors
    .map((product) => `      "${product}": [1,2,3,4,5,6]`)
    .join(",\n");
  const featureScoreTemplate = competitors
    .map((product) => `        "${product}": "yes"`)
    .join(",\n");
  const competitorDetails = [
    { name: input.comp1, category: input.comp1Category, desc: input.comp1Desc },
    { name: input.comp2, category: input.comp2Category, desc: input.comp2Desc },
    { name: input.comp3, category: input.comp3Category, desc: input.comp3Desc }
  ]
    .filter((item) => item.name.trim())
    .map(
      (item, index) =>
        `  ${index + 1}. 名称：${item.name}\n     产品类别：${item.category || "未提供"}\n     产品描述：${item.desc || "未提供"}`
    )
    .join("\n");

  return `你是资深战略分析师与 SaaS 产品顾问。请基于输入信息，输出一份中文竞品分析结果。

严格要求：
1. 只返回 JSON，不要 markdown，不要代码块，不要额外解释。
2. 所有字段都必须填写。
3. radar.dimensions 必须严格等于：${JSON.stringify(RADAR_DIMENSIONS)}。
4. radar.scores 中每个产品的分数数组长度必须与 dimensions 一致，范围 1-10。
5. features 必须返回 8 到 10 条。
6. opportunities 必须返回 5 到 7 条。
7. stats 必须恰好 3 条。
8. SWOT 四个字段每个至少 3 条。
9. features.scores 的取值只能是 yes / partial / no。
10. 每个 opportunities 项尽量补充可公开访问的支持链接；如果不确定真实链接，source_title 和 source_url 返回空字符串。
11. 必须为所有产品都输出 radar.scores 和 features.scores，不允许遗漏任何竞品。
12. 如果信息不足，也要基于品类常识、产品类别、产品描述做相对判断，不要把竞品分数当作占位符统一写成 5。
13. 禁止某个产品 6 个雷达维度全部给出同一个分数，除非该产品确实各维度完全均衡，但这种情况极少，应尽量拉开差异。
14. 同类产品之间要体现强弱差异，分数应服务于比较，不是平均分配。
15. 请结合品类常识、竞品定位、用户群体和 AI 能力成熟度进行合理分析。

输入信息：
- 我方产品：${input.myProduct}
- 产品类别：${input.category}
- 产品描述：${input.myDesc || "未提供"}
- 竞品列表：${competitors.slice(1).join("、")}
- 竞品详情：
${competitorDetails}

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
${radarScoreTemplate}
    }
  },
  "features": [
    {
      "name": "功能名称",
      "category": "功能分类",
      "scores": {
${featureScoreTemplate}
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
      "tags": ["tag1", "tag2"],
      "source_title": "string",
      "source_url": "https://example.com"
    }
  ]
}`;
}
