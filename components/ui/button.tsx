"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-[#F5C542] focus-visible:ring-2 focus-visible:ring-[#F5C542]/40 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#F5C542] text-[#0a0a0a] font-semibold hover:bg-[#EAB308] shadow-[0_0_16px_rgba(245,197,66,0.35)] active:scale-[0.98]",
        outline:
          "border-[var(--surface-border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] hover:border-[var(--surface-border)] aria-expanded:bg-[var(--surface-elevated)] aria-expanded:text-[var(--text-primary)]",
        secondary:
          "bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--surface-border)] hover:bg-[var(--surface-elevated)]",
        ghost:
          "hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] aria-expanded:bg-[var(--surface-elevated)]",
        destructive:
          "bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-[#F5C542] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-2 px-4 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 text-[0.8rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-9",
        "icon-xs":
          "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
