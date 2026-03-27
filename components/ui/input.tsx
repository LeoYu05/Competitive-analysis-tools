import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-11 w-full rounded-xl border border-border bg-white/5 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
