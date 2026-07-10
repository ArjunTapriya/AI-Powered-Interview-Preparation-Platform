import { useRef, useCallback } from "react";

/**
 * useTilt — adds a 3D perspective tilt effect based on cursor position.
 * The card "leans toward" the mouse for a premium depth feel.
 *
 * Usage:
 *   const { ref, onMouseMove, onMouseLeave } = useTilt<HTMLDivElement>();
 *   <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className="tilt-card ...">
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(maxTilt = 8) {
  const ref = useRef<T>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateY = x * maxTilt * 2;
      const rotateX = -y * maxTilt * 2;
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
      el.style.boxShadow = `${-rotateY * 0.8}px ${rotateX * 0.8}px 30px rgba(0,0,0,0.4), 0 0 20px rgba(var(--accent-rgb, 249, 115, 22), 0.1)`;
    },
    [maxTilt]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)";
    el.style.boxShadow = "";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
