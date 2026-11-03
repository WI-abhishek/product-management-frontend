import { useEffect, useState } from "react";

interface Breakpoints {
  isBelow576px: boolean;
  isBelow768px: boolean;
  isBelow1024px: boolean;
  isBelow1200px: boolean;
}

export function useBreakpoint(): Breakpoints {
  const [isBelow576px, setIsBelow576px] = useState(
    () => window.matchMedia("(max-width: 576px)").matches,
  );
  const [isBelow768px, setIsBelow768px] = useState(
    () => window.matchMedia("(max-width: 768px)").matches,
  );
  const [isBelow1024px, setIsBelow1024px] = useState(
    () => window.matchMedia("(max-width: 1024px)").matches,
  );
  const [isBelow1200px, setIsBelow1200px] = useState(
    () => window.matchMedia("(max-width: 1200px)").matches,
  );

  useEffect(() => {
    const mediaQuery576 = window.matchMedia("(max-width: 576px)");
    const mediaQuery768 = window.matchMedia("(max-width: 768px)");
    const mediaQuery1024 = window.matchMedia("(max-width: 1024px)");
    const mediaQuery1200 = window.matchMedia("(max-width: 1200px)");

    const handle576Change = (e: MediaQueryListEvent) => setIsBelow576px(e.matches);
    const handle768Change = (e: MediaQueryListEvent) => setIsBelow768px(e.matches);
    const handle1024Change = (e: MediaQueryListEvent) => setIsBelow1024px(e.matches);
    const handle1200Change = (e: MediaQueryListEvent) => setIsBelow1200px(e.matches);

    mediaQuery576.addEventListener("change", handle576Change);
    mediaQuery768.addEventListener("change", handle768Change);
    mediaQuery1024.addEventListener("change", handle1024Change);
    mediaQuery1200.addEventListener("change", handle1200Change);

    return () => {
      mediaQuery576.removeEventListener("change", handle576Change);
      mediaQuery768.removeEventListener("change", handle768Change);
      mediaQuery1024.removeEventListener("change", handle1024Change);
      mediaQuery1200.removeEventListener("change", handle1200Change);
    };
  }, []);

  return { isBelow576px, isBelow768px, isBelow1200px, isBelow1024px };
}
