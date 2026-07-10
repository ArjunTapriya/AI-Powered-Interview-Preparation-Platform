import React, { useRef, useCallback } from "react";
import { cn } from "../../utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hoverable?: boolean;
  overflowHidden?: boolean;
  /** Enable cursor-reactive spotlight glow effect */
  cursorGlow?: boolean;
  /** Enable 3D tilt on hover */
  tilt?: boolean;
  /** Custom accent color as RGB string e.g. "249, 115, 22" */
  accentRgb?: string;
}

export const Card: React.FC<CardProps> = ({
  className,
  glow = false,
  hoverable = true,
  overflowHidden = true,
  cursorGlow = true,
  tilt = false,
  accentRgb,
  children,
  onMouseMove,
  onMouseLeave,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (cursorGlow) {
        const el = ref.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          el.style.setProperty("--mouse-x", `${x}%`);
          el.style.setProperty("--mouse-y", `${y}%`);

          if (tilt) {
            const tx = (e.clientX - rect.left) / rect.width - 0.5;
            const ty = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.transform = `perspective(800px) rotateX(${-ty * 8}deg) rotateY(${tx * 8}deg) translateY(-3px)`;
          }
        }
      }
      onMouseMove?.(e);
    },
    [cursorGlow, tilt, onMouseMove]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (cursorGlow && ref.current) {
        ref.current.style.setProperty("--mouse-x", "50%");
        ref.current.style.setProperty("--mouse-y", "50%");
        if (tilt) ref.current.style.transform = "";
      }
      onMouseLeave?.(e);
    },
    [cursorGlow, tilt, onMouseLeave]
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        // Base glass layer
        glow ? "glass-panel-glow breathing-glow" : "glass-panel",
        // Cursor glow spotlight
        cursorGlow && "cursor-glow-card shimmer-card",
        // Hover float lift
        hoverable && "glass-card-hover",
        "rounded-xl p-6",
        overflowHidden && "overflow-hidden",
        className
      )}
      style={{
        "--accent-rgb": accentRgb || "249, 115, 22",
        "--mouse-x": "50%",
        "--mouse-y": "50%",
        ...(props.style || {}),
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
};
