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

export function RadarPanel({ radar }: RadarPanelProps) {
  const products = Object.keys(radar.scores);
  const chartData = radar.dimensions.map((dimension, index) => {
    const row: Record<string, string | number> = { dimension };
    for (const product of products) {
      row[product] = radar.scores[product][index];
    }
    return row;
  });

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
                {radar.dimensions.map((dimension, index) => (
                  <div key={`${product}-${dimension}`} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{dimension}</span>
                    <span className="font-medium text-foreground">{radar.scores[product][index]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
