import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { LoaderComponent } from "@/theme/loader/loader";
import { Toaster } from "sonner";

function App() {
  useEffect(() => {
    const scrollTimeouts = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

    const handleGlobalScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target?.classList &&
        (target.classList.contains("srcoll-visible-only-vertical") ||
          target.classList.contains("scroll-visible-only-vertical"))
      ) {
        target.classList.add("scrolling");
        const existing = scrollTimeouts.get(target);
        if (existing) {
          clearTimeout(existing);
        }
        const timer = setTimeout(() => {
          target.classList.remove("scrolling");
          scrollTimeouts.delete(target);
        }, 800);
        scrollTimeouts.set(target, timer);
      }
    };

    window.addEventListener("scroll", handleGlobalScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener("scroll", handleGlobalScroll, { capture: true });
    };
  }, []);

  return (
    <>
      <Suspense>
        <Outlet />
        <LoaderComponent />
        <Toaster position="top-right" closeButton duration={2000} richColors />
      </Suspense>
    </>
  );
}

export default App;
