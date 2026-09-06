"use client";

import { useEffect } from "react";

export function LanRemoteNav() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const focusable = Array.from(
        document.querySelectorAll<HTMLElement>('a[data-lan-nav="true"], button[data-lan-nav="true"]')
      );
      if (focusable.length === 0) return;

      const currentIndex = focusable.findIndex((el) => el === document.activeElement);

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % focusable.length;
        focusable[nextIndex]?.focus();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
        focusable[prevIndex]?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
