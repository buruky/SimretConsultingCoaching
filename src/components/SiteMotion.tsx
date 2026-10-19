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
        gsap.utils.toArray<HTMLElement>("[data-count-to]").forEach((el) => {
          el.textContent = `${el.dataset.countPrefix ?? ""}${el.dataset.countTo}${el.dataset.countSuffix ?? ""}`;
        });
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

        gsap.to(heroMedia, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: heroMedia.closest("section") ?? heroMedia,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Count-up: numbers animate from 0 to their target the first time
      // they scroll into view, e.g. <span data-count-to="150" data-count-prefix="$">
      gsap.utils.toArray<HTMLElement>("[data-count-to]").forEach((el) => {
        const to = Number(el.dataset.countTo);
        const prefix = el.dataset.countPrefix ?? "";
        const suffix = el.dataset.countSuffix ?? "";
        const counter = { val: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () =>
            gsap.to(counter, {
              val: to,
              duration: 1.4,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = `${prefix}${Math.round(counter.val)}${suffix}`;
              },
            }),
        });
      });
    });

    // Magnetic pull + click-spark on [data-magnetic] buttons. Delegated on
    // document so it keeps working regardless of which island rendered the
    // button or when (nav, hero, footer all share this).
    const magneticTweens = new WeakMap<HTMLElement, { x: Function; y: Function }>();
    const getMagneticTween = (el: HTMLElement) => {
      let tween = magneticTweens.get(el);
      if (!tween) {
        tween = {
          x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }),
        };
        magneticTweens.set(el, tween);
      }
      return tween;
    };

    const onPointerMove = (e: MouseEvent) => {
      const magnetic = (e.target as HTMLElement)?.closest<HTMLElement>("[data-magnetic]");
      if (magnetic && !prefersReducedMotion) {
        const rect = magnetic.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        const tween = getMagneticTween(magnetic);
        tween.x(relX * 0.3);
        tween.y(relY * 0.3);
      }

      const spotlight = (e.target as HTMLElement)?.closest<HTMLElement>("[data-spotlight]");
      if (spotlight) {
        const rect = spotlight.getBoundingClientRect();
        spotlight.style.setProperty("--x", `${e.clientX - rect.left}px`);
        spotlight.style.setProperty("--y", `${e.clientY - rect.top}px`);
      }
    };
    document.addEventListener("mousemove", onPointerMove);

    const onPointerLeave = (e: MouseEvent) => {
      const magnetic = (e.target as HTMLElement)?.closest<HTMLElement>("[data-magnetic]");
      if (!magnetic) return;
      const tween = getMagneticTween(magnetic);
      tween.x(0);
      tween.y(0);
    };
    document.addEventListener("mouseout", onPointerLeave);

    const onMagneticClick = (e: MouseEvent) => {
      const magnetic = (e.target as HTMLElement)?.closest<HTMLElement>("[data-magnetic]");
      if (!magnetic || prefersReducedMotion) return;
      const spark = document.createElement("span");
      spark.style.cssText = `position:absolute;left:${e.clientX - (magnetic.getBoundingClientRect().left)}px;top:${
        e.clientY - magnetic.getBoundingClientRect().top
      }px;width:8px;height:8px;margin:-4px;border-radius:9999px;background:currentColor;opacity:0.6;pointer-events:none;`;
      magnetic.appendChild(spark);
      gsap.to(spark, {
        scale: 6,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => spark.remove(),
      });
    };
    document.addEventListener("click", onMagneticClick);

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      document.removeEventListener("click", onAnchorClick);
      document.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("mouseout", onPointerLeave);
      document.removeEventListener("click", onMagneticClick);
      ctx.revert();
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
