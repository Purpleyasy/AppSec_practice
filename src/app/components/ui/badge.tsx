import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-[var(--focus-ring)] focus-visible:ring-[var(--focus-ring)]/30 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--primary)] text-[var(--primary-contrast)] [a&]:hover:bg-[var(--primary-hover)] shadow-sm",
        secondary:
          "border-transparent bg-[var(--secondary)] text-[var(--secondary-contrast)] [a&]:hover:bg-[var(--secondary-hover)] shadow-sm",
        destructive:
          "border-transparent bg-[var(--danger)] text-white [a&]:hover:bg-[var(--danger)]/90 focus-visible:ring-[var(--danger)]/30 shadow-sm",
        outline:
          "text-foreground border-[var(--border-strong)] bg-[var(--surface)] [a&]:hover:bg-[var(--accent-bg)] [a&]:hover:text-[var(--accent-hover)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };