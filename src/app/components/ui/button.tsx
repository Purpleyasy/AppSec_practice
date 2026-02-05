import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus:outline-none focus-visible:outline-none disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        default: "text-[var(--button-primary-text)] border border-[var(--button-primary-border)] hover:text-[var(--button-primary-hover-text)] active:translate-y-px [background:var(--button-primary-bg)] hover:[background:var(--button-primary-hover-bg)]",
        destructive:
          "bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)] hover:bg-[var(--danger)]/10 focus-visible:ring-[var(--danger)]/30 active:translate-y-px",
        outline:
          "border border-[var(--button-secondary-border)] text-[var(--button-secondary-text)] hover:text-[var(--button-secondary-hover-text)] [background:var(--button-secondary-bg)] hover:[background:var(--button-secondary-hover-bg)]",
        secondary:
          "text-[var(--button-secondary-text)] border border-[var(--button-secondary-border)] hover:text-[var(--button-secondary-hover-text)] active:translate-y-px [background:var(--button-secondary-bg)] hover:[background:var(--button-secondary-hover-bg)]",
        ghost:
          "hover:bg-[var(--button-ghost-hover-bg)] border border-transparent hover:border-[var(--border-subtle)]",
        link: "text-[var(--accent-full)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, style, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  // Add depth shadow for default, secondary, destructive variants
  const shouldHaveShadow = variant === "default" || variant === "secondary" || variant === "destructive";
  const buttonStyle = shouldHaveShadow && !props.disabled
    ? { ...style, boxShadow: "var(--button-shadow)" }
    : style;

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        shouldHaveShadow && "hover:shadow-[var(--button-shadow-hover)]"
      )}
      style={buttonStyle}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };