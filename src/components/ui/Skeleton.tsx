import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "circular" | "rectangular" | "text";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
}) => {
  const baseClasses = "animate-pulse bg-white/10";
  let variantClasses = "rounded-md";

  if (variant === "circular") {
    variantClasses = "rounded-full";
  } else if (variant === "text") {
    variantClasses = "rounded h-4 w-full";
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      aria-hidden="true"
    />
  );
};
