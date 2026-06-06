import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn("grid gap-2", className)} {...props} />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

/** Segmented pill-style radio item (label wraps the control). */
const RadioPill = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & { label: string }
>(({ className, label, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "flex-1 cursor-pointer rounded-xl border-2 border-input bg-white px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all",
      "hover:border-primary/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15",
      "data-[state=checked]:border-primary data-[state=checked]:bg-emerald-50 data-[state=checked]:text-emerald-800 data-[state=checked]:shadow-sm",
      className
    )}
    {...props}
  >
    {label}
  </RadioGroupPrimitive.Item>
));
RadioPill.displayName = "RadioPill";

export { RadioGroup, RadioPill };
