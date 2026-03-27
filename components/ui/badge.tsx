import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
        secondary: "border-white/10 bg-white/6 text-slate-200",
        high: "border-rose-400/20 bg-rose-400/10 text-rose-200",
        medium: "border-amber-400/20 bg-amber-400/10 text-amber-200",
        low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
