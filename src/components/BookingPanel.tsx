import { useEffect, useRef, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

const CAL_CONFIGURED = true;

// WEEKEND WORKSHOP: paste the Cal.com link of the workshop event here, e.g.
//   "https://cal.com/kebreab-yimesgen-nudzqr/weekend-workshop-march"
// Leave it "" when no workshop is scheduled; the tab then says so instead.
const WORKSHOP_EVENT_URL = "";

const SESSION_TYPES = [
  { id: "premarital", label: "Premarital Coaching", calLink: "kebreab-yimesgen-nudzqr/premarital-counseling" },
  { id: "individual-couples", label: "Individual & Couples", calLink: "kebreab-yimesgen-nudzqr/couples-individual-counseling-150" },
  { id: "parenting", label: "Parenting Coaching", calLink: "kebreab-yimesgen-nudzqr/parenting-education-coaching-150" },
  // shortcut: changing WORKSHOP_EVENT_URL needs a redeploy; check Cal's
  // availability API instead if that gets old.
  {
    id: "workshop",
    label: "Weekend Workshop",
    calLink: WORKSHOP_EVENT_URL.trim().replace(/^https?:\/\/(app\.)?cal\.com\//, "").replace(/\/$/, ""),
    open: WORKSHOP_EVENT_URL.trim() !== "",
    note: "Workshops run on set dates. Look for upcoming workshop events below and reserve a spot for you and your spouse.",
  },
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

  // Let the "Book this session" cards in the Services section pick a tab
  // here. Services.astro stores the target tab id in sessionStorage (read
  // once on mount, for when this panel wasn't hydrated yet) and also fires
  // a "select-booking-tab" event (handled live, for when it was already on
  // screen and mounted).
  useEffect(() => {
    // Clear the handoff value whichever path consumed it (and even if it's
    // stale or unrecognized), so it can't leak into a later page load in the
    // same tab and quietly override the default tab.
    const clearStored = () => {
      try {
        sessionStorage.removeItem("bookingTab");
      } catch {
        // sessionStorage unavailable — nothing to clear.
      }
    };

    const applyTab = (tab: string | null | undefined) => {
      clearStored();
      if (!tab) return;
      const match = SESSION_TYPES.find((s) => s.id === tab);
      if (!match) return;
      setReady(false);
      setActive(match.id);
    };

    try {
      const stored = sessionStorage.getItem("bookingTab");
      if (stored) applyTab(stored);
    } catch {
      // sessionStorage unavailable — the event listener below still works.
    }

    const handleSelect = (event: Event) => {
      applyTab((event as CustomEvent<string>).detail);
    };
    window.addEventListener("select-booking-tab", handleSelect);
    return () => window.removeEventListener("select-booking-tab", handleSelect);
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
  const live = CAL_CONFIGURED && !("open" in current && !current.open);
  const isWorkshop = current.id === "workshop";

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

      {live && "note" in current && (
        <p className="mb-6 max-w-2xl text-sm text-ink-700">{current.note}</p>
      )}

      <div
        ref={embedRef}
        className={`relative overflow-hidden rounded-2xl ${
          live && !ready ? "min-h-120" : ""
        }`}
      >
        {live ? (
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
            <p className="font-display text-2xl text-ink-900">
              {isWorkshop ? "No workshops scheduled right now" : "Booking opens soon"}
            </p>
            <p className="max-w-sm text-sm text-ink-500">
              {isWorkshop
                ? "New weekend dates are posted here as they're set. Reach out to hear about the next one, or to plan a workshop for your group."
                : `Online scheduling is being connected. In the meantime, reach out directly to set up a ${current.label.toLowerCase()} session.`}
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
        A $25 deposit is charged when you book. To reschedule or cancel,
        please do so at least 24 hours before your session.
      </p>
    </div>
  );
}
