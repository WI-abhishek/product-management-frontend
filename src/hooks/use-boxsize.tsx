import { useEffect, useState } from "react";

interface BoxSize {
  width?: number;
  height?: number;
}

export function useBoxSize(ref: any): BoxSize {
  const [size, setSize] = useState<BoxSize>({ width: undefined, height: undefined });

  useEffect(() => {
    if (!ref.current || typeof window === "undefined" || !("ResizeObserver" in window)) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return size;
}
