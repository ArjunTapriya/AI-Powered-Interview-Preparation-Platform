import { useRef, useCallback } from "react";

/**
 * useCursorGlow — attaches cursor-tracking CSS variables (--mouse-x, --mouse-y)
 * to an element for the cursor-reactive spotlight glow effect defined in effects.css.
 *
 * Usage:
 *   const { ref, onMouseMove } = useCursorGlow<HTMLDivElement>();
 *   <div ref={ref} onMouseMove={onMouseMove} className="cursor-glow-card ...">
 */
export function useCursorGlow<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mouse-x", `${x}%`);
    el.style.setProperty("--mouse-y", `${y}%`);
  }, []);

  const onMouseLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.setProperty("--mouse-x", "50%");
      ref.current.style.setProperty("--mouse-y", "50%");
    }
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
