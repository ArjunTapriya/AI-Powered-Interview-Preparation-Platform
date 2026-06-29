import React from "react";
import { cn } from "../../utils/cn";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  colorClassName?: string;
  size?: "sm" | "md" | "lg";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  colorClassName = "bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-glow)]",
  size = "md",
  className,
  ...props
}) => {
  const percentage = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "w-full bg-white/5 rounded-full overflow-hidden border border-white/5",
        {
          "h-1.5": size === "sm",
          "h-3": size === "md",
          "h-5": size === "lg",
        },
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-500 ease-out rounded-full", colorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
