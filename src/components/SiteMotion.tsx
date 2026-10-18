import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * Invisible, mounted once per page. Owns the two things every section relies on:
 * smooth inertia scrolling (Lenis, synced to GSAP's ticker) and a single
 * ScrollTrigger batch that fades/lifts any [data-reveal] element into view.
 * Centralizing this avoids re-initializing GSAP/Lenis per section island.
 */
export default function SiteMotion() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0 : 1.1,
      smoothWheel: !prefersReducedMotion,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Let Lenis own anchor-link scrolling instead of the browser's native
    // scroll-smooth — the two fighting for control was leaving sections
    // stuck mid-fade when a nav link jumped straight to them.
    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest("a[href^='#']");
      const href = anchor?.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -72 });
    };
    document.addEventListener("click", onAnchorClick);

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set("[data-reveal]", { opacity: 1, y: 0 });
        return;
      }

      ScrollTrigger.batch("[data-reveal]", {
        start: "top 85%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
          }),
        once: true,
      });

      const heroWords = gsap.utils.toArray<HTMLElement>("[data-hero-word]");
      if (heroWords.length) {
        gsap.set(heroWords, { yPercent: 110 });
        gsap.to(heroWords, {
          yPercent: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.07,
          delay: 0.2,
        });
      }

      const heroMedia = document.querySelector("[data-hero-media]");
      if (heroMedia) {
        gsap.from(heroMedia, {
          opacity: 0,
          scale: 1.06,
          duration: 1.4,
          ease: "power2.out",
          delay: 0.3,
        });
      }
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      document.removeEventListener("click", onAnchorClick);
      ctx.revert();
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
