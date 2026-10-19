import { useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#book", label: "Book" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Written straight to the DOM (not React state) so scrolling doesn't
    // trigger a re-render on every frame.
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open
          ? "bg-sand-100/90 backdrop-blur-md border-b border-ink-900/10"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
        <a href="#home" className="font-display text-lg tracking-tight text-ink-900">
          Simret<span className="inline-block text-forest-500 animate-pulse-soft">.</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="relative text-sm text-ink-700 transition-colors hover:text-forest-700 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-forest-500 after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#book"
          data-magnetic
          className="hidden rounded-full bg-ink-900 px-5 py-2.5 text-sm text-sand-50 transition-colors hover:bg-forest-600 md:inline-block"
        >
          Book a session
        </a>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-px w-6 bg-ink-900 transition-transform duration-300 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-6 bg-ink-900 transition-transform duration-300 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      <div
        ref={progressRef}
        aria-hidden="true"
        className="h-0.5 origin-left scale-x-0 bg-forest-500/70"
      />

      <div
        className={`md:hidden ${open ? "block" : "hidden"} border-t border-ink-900/10 bg-sand-100 px-6 py-8`}
      >
        <ul className="flex flex-col gap-6">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-display text-2xl text-ink-900"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#book"
              onClick={() => setOpen(false)}
              className="mt-2 inline-block rounded-full bg-ink-900 px-5 py-2.5 text-sm text-sand-50"
            >
              Book a session
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
