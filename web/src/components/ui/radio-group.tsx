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

/**
 * Segmented-control style radio item — renders the label text as a pill.
 */
const SegmentItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & { label: React.ReactNode }
>(({ className, label, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "flex-1 cursor-pointer rounded-xl border border-input bg-white px-3 py-2.5 text-center text-sm font-semibold text-muted-foreground transition-all hover:border-brand-300 focus-visible:outline-none data-[state=checked]:border-brand-500 data-[state=checked]:bg-brand-50 data-[state=checked]:text-brand-800 data-[state=checked]:shadow-sm",
      className
    )}
    {...props}
  >
    {label}
  </RadioGroupPrimitive.Item>
));
SegmentItem.displayName = "SegmentItem";

export { RadioGroup, SegmentItem };
