import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#0F2D5E] text-white",
        secondary: "border-transparent bg-[#F4A900] text-[#0F2D5E]",
        destructive: "border-transparent bg-red-600 text-white",
        outline: "text-slate-700 border-slate-200",
        pending: "border-amber-200 bg-amber-50 text-amber-700",
        processing: "border-blue-200 bg-blue-50 text-blue-700",
        ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
        released: "border-slate-200 bg-slate-50 text-slate-700",
        rejected: "border-red-200 bg-red-50 text-red-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
