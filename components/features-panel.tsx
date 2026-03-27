import { Fragment } from "react";
import { Check, Circle, CircleDot } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/types";

type FeaturesPanelProps = {
  features: AnalysisResult["features"];
};

const scoreMeta = {
  yes: {
    label: "支持",
    icon: Check,
    className: "text-emerald-300"
  },
  partial: {
    label: "部分支持",
    icon: CircleDot,
    className: "text-amber-300"
  },
  no: {
    label: "未覆盖",
    icon: Circle,
    className: "text-slate-400"
  }
};

export function FeaturesPanel({ features }: FeaturesPanelProps) {
  const products = Object.keys(features[0]?.scores ?? {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>功能矩阵</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div
            className="grid gap-px rounded-2xl bg-border/60 p-px"
            style={{
              gridTemplateColumns: `minmax(180px,1.2fr) minmax(140px,0.8fr) repeat(${products.length}, minmax(120px, 1fr))`
            }}
          >
            <div className="bg-slate-950/90 px-4 py-3 text-sm font-medium text-muted-foreground">功能维度</div>
            <div className="bg-slate-950/90 px-4 py-3 text-sm font-medium text-muted-foreground">分类</div>
            {products.map((product) => (
              <div
                key={product}
                className="bg-slate-950/90 px-4 py-3 text-sm font-medium text-muted-foreground"
              >
                {product}
              </div>
            ))}

            {features.map((feature) => (
              <Fragment key={feature.name}>
                <div className="bg-card/90 px-4 py-3 text-sm text-foreground">
                  {feature.name}
                </div>
                <div className="bg-card/90 px-4 py-3 text-sm text-muted-foreground">
                  {feature.category}
                </div>
                {products.map((product) => {
                  const meta = scoreMeta[feature.scores[product]];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={`${feature.name}-${product}`}
                      className="flex items-center gap-2 bg-card/90 px-4 py-3 text-sm"
                    >
                      <Icon className={`h-4 w-4 ${meta.className}`} />
                      <span className="text-foreground/90">{meta.label}</span>
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
