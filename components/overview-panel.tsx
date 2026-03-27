import { Activity, Compass, Sparkle, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/types";

type OverviewPanelProps = {
  overview: AnalysisResult["overview"];
};

const icons = [TrendingUp, Activity, Compass];

export function OverviewPanel({ overview }: OverviewPanelProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-[1.6fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>市场概览</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
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
          </CardContent>
        </Card>
        <div className="grid gap-4">
          {overview.stats.map((item, index) => {
            const Icon = icons[index] ?? TrendingUp;
            return (
              <Card key={`${item.label}-${index}`}>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
