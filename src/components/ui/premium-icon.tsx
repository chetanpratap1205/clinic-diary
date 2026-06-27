import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const premiumIconVariants = cva(
  "inline-flex items-center justify-center shrink-0 transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20",
        solid: "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5",
        success: "bg-emerald-500/10 text-emerald-600 shadow-sm ring-1 ring-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-600 shadow-sm ring-1 ring-amber-500/20",
        destructive: "bg-red-500/10 text-red-600 shadow-sm ring-1 ring-red-500/20",
        purple: "bg-purple-500/10 text-purple-600 shadow-sm ring-1 ring-purple-500/20",
        glass: "bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]",
        outline: "border-2 border-primary/20 text-primary hover:bg-primary/5",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-8 w-8",
        default: "h-10 w-10",
        md: "h-12 w-12",
        lg: "h-14 w-14",
        xl: "h-16 w-16",
      },
      shape: {
        default: "rounded-xl",
        circle: "rounded-full",
        square: "rounded-lg",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  }
);

export interface PremiumIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof premiumIconVariants> {
  Icon: LucideIcon;
  iconSize?: number;
  strokeWidth?: number;
}

export function PremiumIcon({
  className,
  variant,
  size,
  shape,
  Icon,
  iconSize,
  strokeWidth = 1.5,
  ...props
}: PremiumIconProps) {
  // Determine icon size based on container size if not explicitly provided
  let defaultIconSize = 20;
  if (size === "sm") defaultIconSize = 16;
  if (size === "md") defaultIconSize = 24;
  if (size === "lg") defaultIconSize = 28;
  if (size === "xl") defaultIconSize = 32;

  return (
    <div
      className={cn(premiumIconVariants({ variant, size, shape, className }))}
      {...props}
    >
      <Icon 
        size={iconSize || defaultIconSize} 
        strokeWidth={strokeWidth} 
        className={cn("transition-transform duration-300", 
          (variant !== 'ghost' && variant !== 'outline') && "drop-shadow-sm"
        )} 
      />
    </div>
  );
}
