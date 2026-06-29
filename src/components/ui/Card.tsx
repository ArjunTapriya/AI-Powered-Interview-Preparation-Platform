import React from "react";
import { cn } from "../../utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  glow = false,
  hoverable = true,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        glow ? "glass-panel-glow breathing-glow" : "glass-panel",
        hoverable && "glass-card-hover",
        "rounded-xl p-6 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
