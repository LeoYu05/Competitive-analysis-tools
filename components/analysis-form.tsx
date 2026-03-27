"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { FlaskConical, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { analysisInputSchema, type AnalysisInput } from "@/lib/types";

type AnalysisFormProps = {
  initialValue?: AnalysisInput | null;
  isLoading: boolean;
  statusText: string;
  onSubmit: (payload: AnalysisInput) => Promise<void>;
};

const EXAMPLE_DATA: AnalysisInput = {
  myProduct: "CompeteIQ",
  category: "AI 竞品分析平台",
  myDesc: "面向产品经理和增长团队，输入产品与竞品后自动生成结构化竞品分析报告。",
  comp1: "Crayon",
  comp1Category: "竞争情报平台",
  comp1Desc: "面向销售与市场团队的竞争情报平台，强调市场监测、竞品动态跟踪与 battlecard 输出。",
  comp2: "Kompyte",
  comp2Category: "销售赋能与竞品监测平台",
  comp2Desc: "聚焦自动化竞品追踪和销售赋能，支持对手变更监控、情报聚合与 CRM 协同。",
  comp3: "Klue",
  comp3Category: "企业级竞争赋能平台",
  comp3Desc: "强调企业级竞争赋能与情报协作，覆盖情报收集、分发、分析与销售场景落地。"
};

export function AnalysisForm({ initialValue, isLoading, statusText, onSubmit }: AnalysisFormProps) {
  const [form, setForm] = useState<AnalysisInput>(
    initialValue ?? {
      myProduct: "",
      category: "",
      myDesc: "",
      comp1: "",
      comp1Category: "",
      comp1Desc: "",
      comp2: "",
      comp2Category: "",
      comp2Desc: "",
      comp3: "",
      comp3Category: "",
      comp3Desc: ""
    }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof AnalysisInput, string>>>({});

  useEffect(() => {
    if (initialValue) {
      setForm(initialValue);
      setErrors({});
    }
  }, [initialValue]);

  function updateField<K extends keyof AnalysisInput>(key: K, value: AnalysisInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = analysisInputSchema.safeParse(form);

    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof AnalysisInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof AnalysisInput | undefined;
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit(parsed.data);
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-200" />
          新建分析
        </CardTitle>
        <CardDescription>填写产品信息并提交分析。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="myProduct">我方产品名称</Label>
              <Input
                id="myProduct"
                placeholder="例如：CompeteIQ"
                value={form.myProduct}
                onChange={(event) => updateField("myProduct", event.target.value)}
              />
              {errors.myProduct ? <p className="mt-2 text-xs text-rose-300">{errors.myProduct}</p> : null}
            </div>
            <div>
              <Label htmlFor="category">产品类别</Label>
              <Input
                id="category"
                placeholder="例如：AI 竞品分析平台"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
              />
              {errors.category ? <p className="mt-2 text-xs text-rose-300">{errors.category}</p> : null}
            </div>
          </div>

          <div>
            <Label htmlFor="myDesc">产品描述（可选）</Label>
            <Textarea
              id="myDesc"
              placeholder="描述目标用户、核心场景、主要能力或商业模式。"
              value={form.myDesc}
              onChange={(event) => updateField("myDesc", event.target.value)}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <Label htmlFor="comp1">竞品 1</Label>
              <Input
                id="comp1"
                placeholder="必填"
                value={form.comp1}
                onChange={(event) => updateField("comp1", event.target.value)}
              />
              {errors.comp1 ? <p className="mt-2 text-xs text-rose-300">{errors.comp1}</p> : null}
              <Input
                id="comp1Category"
                className="mt-3"
                placeholder="产品类别（可选）"
                value={form.comp1Category}
                onChange={(event) => updateField("comp1Category", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="comp2">竞品 2</Label>
              <Input
                id="comp2"
                placeholder="必填"
                value={form.comp2}
                onChange={(event) => updateField("comp2", event.target.value)}
              />
              {errors.comp2 ? <p className="mt-2 text-xs text-rose-300">{errors.comp2}</p> : null}
              <Input
                id="comp2Category"
                className="mt-3"
                placeholder="产品类别（可选）"
                value={form.comp2Category}
                onChange={(event) => updateField("comp2Category", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="comp3">竞品 3</Label>
              <Input
                id="comp3"
                placeholder="可选"
                value={form.comp3}
                onChange={(event) => updateField("comp3", event.target.value)}
              />
              <Input
                id="comp3Category"
                className="mt-3"
                placeholder="产品类别（可选）"
                value={form.comp3Category}
                onChange={(event) => updateField("comp3Category", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <Label htmlFor="comp1Desc">竞品 1 描述（可选）</Label>
              <Textarea
                id="comp1Desc"
                placeholder="补充该竞品的目标用户、核心场景或主要能力。"
                value={form.comp1Desc}
                onChange={(event) => updateField("comp1Desc", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="comp2Desc">竞品 2 描述（可选）</Label>
              <Textarea
                id="comp2Desc"
                placeholder="补充该竞品的目标用户、核心场景或主要能力。"
                value={form.comp2Desc}
                onChange={(event) => updateField("comp2Desc", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="comp3Desc">竞品 3 描述（可选）</Label>
              <Textarea
                id="comp3Desc"
                placeholder="补充该竞品的目标用户、核心场景或主要能力。"
                value={form.comp3Desc}
                onChange={(event) => updateField("comp3Desc", event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-white/5 p-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-cyan-200" /> : <FlaskConical className="h-4 w-4 text-cyan-200" />}
              <span>{isLoading ? statusText : "支持服务端调用、结果校验和导出。"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm(EXAMPLE_DATA);
                  setErrors({});
                }}
              >
                示例数据
              </Button>
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isLoading ? "分析中..." : "开始分析"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
