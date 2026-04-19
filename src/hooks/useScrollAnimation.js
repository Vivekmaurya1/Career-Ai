import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────── */
/* Scroll animation hook */
/* ─────────────────────────────────────────────────────────────── */
export function useScrollAnimation(visibleClass = "visible", threshold = 0.1) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(visibleClass);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    const targets = ref.current?.querySelectorAll("[data-animate]");
    targets?.forEach((t) => observer.observe(t));

    return () => observer.disconnect();
  }, [visibleClass, threshold]);

  return ref;
}

/* ─────────────────────────────────────────────────────────────── */
/* Click outside hook */
/* ─────────────────────────────────────────────────────────────── */
export function useClickOutside(handler) {
  const ref = useRef(null);

  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [handler]);

  return ref;
}

/* ─────────────────────────────────────────────────────────────── */
/* Body scroll lock hook */
/* ─────────────────────────────────────────────────────────────── */
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isLocked]);
}