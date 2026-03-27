import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/types";

type SwotPanelProps = {
  swot: AnalysisResult["swot"];
};

const sections = [
  {
    key: "strengths",
    title: "Strengths",
    className: "border-emerald-400/20 bg-emerald-400/8"
  },
  {
    key: "weaknesses",
    title: "Weaknesses",
    className: "border-amber-400/20 bg-amber-400/8"
  },
  {
    key: "opportunities",
    title: "Opportunities",
    className: "border-cyan-400/20 bg-cyan-400/8"
  },
  {
    key: "threats",
    title: "Threats",
    className: "border-rose-400/20 bg-rose-400/8"
  }
] as const;

export function SwotPanel({ swot }: SwotPanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map((section) => (
        <Card key={section.key} className={section.className}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-foreground/90">
              {swot[section.key].map((item, index) => (
                <li key={`${section.key}-${index}`} className="rounded-xl border border-white/8 bg-black/10 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
