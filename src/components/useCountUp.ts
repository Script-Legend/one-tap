"use client";

import { useEffect, useRef, useState } from "react";

const DURATION = 560;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Rolls a money figure from its old value to its new one. The first render
 * shows the real number straight away — only later changes animate, so the
 * screen is never briefly wrong on load.
 *
 * Every state update happens inside the animation frame rather than in the
 * effect body, so a reduced-motion viewer takes the same code path and just
 * lands on the final value on the first tick.
 */
export function useCountUp(target: number): number {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (from.current === target) return;

    const origin = from.current;
    const delta = target - origin;
    const duration = prefersReducedMotion() ? 0 : DURATION;
    const start = performance.now();

    const settle = () => {
      from.current = target;
      setShown(target);
    };

    const tick = (at: number) => {
      const elapsed = at - start;
      const t = duration > 0 ? Math.min(elapsed / duration, 1) : 1;

      if (t >= 1) {
        settle();
        return;
      }

      const eased = 1 - Math.pow(1 - t, 3);
      setShown(origin + delta * eased);
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
      from.current = target;
    };
  }, [target]);

  return shown;
}
