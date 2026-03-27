import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/types";

type OpportunitiesPanelProps = {
  opportunities: AnalysisResult["opportunities"];
};

export function OpportunitiesPanel({ opportunities }: OpportunitiesPanelProps) {
  return (
    <div className="grid gap-4">
      {opportunities.map((item, index) => (
        <Card key={`${item.title}-${index}`}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={item.priority}>{item.priority.toUpperCase()}</Badge>
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 text-sm leading-6 text-foreground/85">
            {item.body}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
