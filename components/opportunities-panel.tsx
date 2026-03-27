import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/types";

type OpportunitiesPanelProps = {
  opportunities: AnalysisResult["opportunities"];
};

function buildSearchUrl(item: OpportunitiesPanelProps["opportunities"][number]) {
  const query = [item.title, ...item.tags].filter(Boolean).join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

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
          <CardContent className="pt-0">
            <p className="text-sm leading-6 text-foreground/85">{item.body}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {item.source_url ? (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-cyan-100 transition hover:text-cyan-50"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  {item.source_title || "打开支持链接"}
                </a>
              ) : (
                <a
                  href={buildSearchUrl(item)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  搜索相关外部资料
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
