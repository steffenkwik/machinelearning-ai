import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight determinate progress bar (no Radix dependency needed for a
 * purely presentational meter). `value` is 0–100. The indicator animates
 * from 0 → value on mount for a satisfying fill.
 */
const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: number;
    indicatorClassName?: string;
  }
>(({ className, value, indicatorClassName, ...props }, ref) => {
  const target = Math.max(0, Math.min(100, value));
  const [w, setW] = React.useState(0);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setW(target));
    return () => cancelAnimationFrame(id);
  }, [target]);
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(target)}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-brand-100", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-700 ease-out",
          indicatorClassName
        )}
        style={{ width: `${w}%` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
