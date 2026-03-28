"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/types";

type RadarPanelProps = {
  radar: AnalysisResult["radar"];
};

const colors = ["#67e8f9", "#60a5fa", "#f59e0b", "#34d399"];

const medals = ["🥇", "🥈", "🥉"];

export function RadarPanel({ radar }: RadarPanelProps) {
  const products = Object.keys(radar.scores);
  const chartData = radar.dimensions.map((dimension, index) => {
    const row: Record<string, string | number> = { dimension };
    for (const product of products) {
      row[product] = radar.scores[product][index];
    }
    return row;
  });

  const productTotals = products
    .map((product) => ({
      product,
      total: radar.scores[product].reduce((sum, score) => sum + score, 0),
      avg: (radar.scores[product].reduce((sum, score) => sum + score, 0) / radar.dimensions.length).toFixed(1)
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
      <Card>
        <CardHeader>
          <CardTitle>雷达图对比</CardTitle>
        </CardHeader>
        <CardContent className="h-[360px] pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} outerRadius="72%">
              <PolarGrid stroke="rgba(255,255,255,0.14)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: 16
                }}
              />
              {products.map((product, index) => (
                <Radar
                  key={product}
                  dataKey={product}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.14}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>综合排名</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {productTotals.map((item, rank) => {
              const productIndex = products.indexOf(item.product);
              const color = colors[productIndex % colors.length];
              const pct = Math.round((item.total / (radar.dimensions.length * 10)) * 100);
              return (
                <div key={item.product} className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-center text-base">
                    {medals[rank] ?? `#${rank + 1}`}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{item.product}</p>
                      <p className="shrink-0 text-xs text-muted-foreground">
                        {item.total} 分 / 均 {item.avg}
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>评分明细</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {products.map((product, productIndex) => (
              <div key={product} className="rounded-2xl border border-border/70 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colors[productIndex % colors.length] }}
                  />
                  <p className="font-medium text-foreground">{product}</p>
                </div>
                <div className="space-y-2 text-sm">
                  {radar.dimensions.map((dimension, index) => {
                    const score = radar.scores[product][index];
                    return (
                      <div key={`${product}-${dimension}`} className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">{dimension}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${score * 10}%`,
                                backgroundColor: colors[productIndex % colors.length]
                              }}
                            />
                          </div>
                          <span className="w-4 text-right font-medium text-foreground">{score}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
