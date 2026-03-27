import { Sparkle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisInput, AnalysisResult } from "@/lib/types";

type OverviewPanelProps = {
  input: AnalysisInput;
  overview: AnalysisResult["overview"];
};

export function OverviewPanel({ input, overview }: OverviewPanelProps) {
  const competitorProfiles = [
    { name: input.comp1, category: input.comp1Category, desc: input.comp1Desc },
    { name: input.comp2, category: input.comp2Category, desc: input.comp2Desc },
    { name: input.comp3, category: input.comp3Category, desc: input.comp3Desc }
  ].filter((item) => item.name.trim());
  const analysisBasis = [
    input.category || "产品类别",
    input.myDesc ? "我方产品描述" : "",
    competitorProfiles.some((item) => item.category) ? "竞品类别" : "",
    competitorProfiles.some((item) => item.desc) ? "竞品描述" : ""
  ].filter(Boolean);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>市场概览</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">市场规模</p>
              <p className="mt-2 text-sm leading-6 text-foreground/90">{overview.market_size}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">竞争烈度</p>
              <p className="mt-2 text-sm leading-6 text-foreground/90">{overview.competition_intensity}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">我方定位</p>
              <p className="mt-2 text-sm leading-6 text-foreground/90">{overview.our_position}</p>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
              <div className="flex items-center gap-2 text-cyan-100">
                <Sparkle className="h-4 w-4" />
                核心洞察
              </div>
              <p className="mt-2 text-sm leading-6 text-cyan-50">{overview.key_insight}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">分析范围</p>
              <p className="mt-3 text-base leading-7 text-foreground/90">
                本次对比围绕 {input.myProduct} 与 {competitorProfiles.map((item) => item.name).join("、")} 展开，
                聚焦 {input.category} 场景下的产品能力与竞争位置。
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">判断依据</p>
              <p className="mt-3 text-base leading-7 text-foreground/90">
                当前结论基于 {analysisBasis.join("、")} 与品类常识生成，更适合做方向判断，不应视为外部审计数据。
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">解读重点</p>
              <p className="mt-3 text-base leading-7 text-foreground/90">
                建议结合后续的雷达图、功能矩阵和机会点一起看，重点关注差异化能力、短板维度与可切入机会。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>产品描述参考</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100">我方产品</p>
            <p className="mt-2 font-medium text-white">{input.myProduct}</p>
            <p className="mt-1 text-xs text-cyan-100/80">{input.category}</p>
            <p className="mt-2 text-sm leading-6 text-cyan-50">{input.myDesc || "未提供产品描述"}</p>
          </div>
          {competitorProfiles.map((item) => (
            <div key={item.name} className="rounded-2xl border border-border/70 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">竞品</p>
              <p className="mt-2 font-medium text-foreground">{item.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.category || "未提供产品类别"}</p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">{item.desc || "未提供产品描述"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
