import { useEffect, useRef, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

// shortcut: Individual & Couples still points at a sample event. Swap in its
// real event slug once it exists on the client's Cal.com account.
const CAL_CONFIGURED = true;

const SESSION_TYPES = [
  { id: "individual-couples", label: "Individual & Couples", calLink: "buruk-yimesgen-xvoxel/15min" },
  { id: "premarital", label: "Premarital Coaching", calLink: "kebreab-yimesgen-nudzqr/premarital-counseling" },
] as const;

export default function BookingPanel() {
  const [active, setActive] = useState<(typeof SESSION_TYPES)[number]["id"]>(
    SESSION_TYPES[0].id
  );
  const [ready, setReady] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!CAL_CONFIGURED) return;
    (async () => {
      const cal = await getCalApi();
      cal("on", {
        action: "linkReady",
        callback: () => setReady(true),
      });
    })();
  }, []);

  // Cal's embed script creates its own <iframe> outside React's control and
  // doesn't expose a way to set `loading` on it, so mark it lazy ourselves
  // once it shows up (the section is already client:visible-gated, but dev
  // tools still flag the tag itself without the attribute).
  useEffect(() => {
    if (!CAL_CONFIGURED || !embedRef.current) return;
    const container = embedRef.current;
    const markLazy = () => container.querySelector("iframe")?.setAttribute("loading", "lazy");
    markLazy();
    const observer = new MutationObserver(markLazy);
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [active]);

  const current = SESSION_TYPES.find((s) => s.id === active)!;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist">
        {SESSION_TYPES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={active === s.id}
            onClick={() => {
              setReady(false);
              setActive(s.id);
            }}
            className={`rounded-full px-5 py-2.5 text-sm transition-all active:scale-95 ${
              active === s.id
                ? "bg-ink-900 text-sand-50"
                : "bg-sand-50 text-ink-700 hover:bg-sand-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        ref={embedRef}
        className={`relative overflow-hidden rounded-2xl ${
          CAL_CONFIGURED && !ready ? "min-h-120" : ""
        }`}
      >
        {CAL_CONFIGURED ? (
          <>
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-sand-200">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-900/20 border-t-forest-500" />
              </div>
            )}
            {/* No fixed height here on purpose: Cal auto-resizes its iframe to
                fit the actual content, and pinning this to 480px left a gap
                of our own background showing below the shorter calendar. */}
            <Cal
              key={current.id}
              calLink={current.calLink}
              style={{ width: "100%" }}
              config={{ layout: "month_view" }}
            />
          </>
        ) : (
          <div className="flex min-h-[480px] flex-col items-center justify-center gap-4 p-10 text-center">
            <p className="font-display text-2xl text-ink-900">Booking opens soon</p>
            <p className="max-w-sm text-sm text-ink-500">
              Online scheduling is being connected. In the meantime, reach
              out directly to set up a {current.label.toLowerCase()} session.
            </p>
            <a
              href="#contact"
              className="mt-2 rounded-full bg-forest-500 px-6 py-3 text-sm text-sand-50 transition-colors hover:bg-forest-600"
            >
              Get in touch
            </a>
          </div>
        )}
      </div>

      <p className="mt-6 max-w-2xl text-xs leading-relaxed text-ink-500">
        A 25% non-refundable deposit is required to confirm your booking.
        Reschedule anytime through the booking system. Cancellations need at
        least 24 hours notice; missed sessions are billed at 50%.
      </p>
    </div>
  );
}
