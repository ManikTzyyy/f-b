"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva } from "class-variance-authority";
import { cn } from "cn"

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted data-[state=on]:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-muted",
        blue:
          "bg-blue-200/50 text-blue-600 font-semibold aria-pressed:bg-stone-100 aria-pressed:text-stone-200 data-[state=on]:bg-stone-100 data-[state=on]:text-stone-200",
        green:
          "bg-green-200/50 text-green-600 font-semibold aria-pressed:bg-stone-100 aria-pressed:text-stone-200 data-[state=on]:bg-stone-100 data-[state=on]:text-stone-200",
        yellow:
          "bg-yellow-200/50 text-yellow-600 font-semibold aria-pressed:bg-stone-100 aria-pressed:text-stone-200 data-[state=on]:bg-stone-100 data-[state=on]:text-stone-200",
        red:
          "bg-red-200/50 text-red-600 font-semibold aria-pressed:bg-stone-100 aria-pressed:text-stone-200 data-[state=on]:bg-stone-100 data-[state=on]:text-stone-200",
        purple:
          "bg-purple-200/50 text-purple-600 font-semibold aria-pressed:bg-stone-100 aria-pressed:text-stone-200 data-[state=on]:bg-stone-100 data-[state=on]:text-stone-200",
      },
      size: {
        default:
          "h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
