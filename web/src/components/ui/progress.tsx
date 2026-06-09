import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight determinate progress bar (no Radix dependency needed for a
 * purely presentational meter). `value` is 0–100.
 */
const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: number;
    indicatorClassName?: string;
  }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <div
    ref={ref}
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(value)}
    className={cn("h-2.5 w-full overflow-hidden rounded-full bg-brand-100", className)}
    {...props}
  >
    <div
      className={cn(
        "h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-700 ease-out",
        indicatorClassName
      )}
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
));
Progress.displayName = "Progress";

export { Progress };
