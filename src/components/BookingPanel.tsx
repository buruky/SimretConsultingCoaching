import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

// shortcut: Cal.com account isn't created yet, so these slugs are placeholders.
// Set CAL_CONFIGURED to true and fill in the real event slugs once the
// client's Cal.com account + event types exist (see backend.md).
const CAL_CONFIGURED = false;

const SESSION_TYPES = [
  { id: "individual-couples", label: "Individual & Couples", calLink: "simret-coaching/individual-couples" },
  { id: "premarital", label: "Premarital Coaching", calLink: "simret-coaching/premarital" },
] as const;

export default function BookingPanel() {
  const [active, setActive] = useState<(typeof SESSION_TYPES)[number]["id"]>(
    SESSION_TYPES[0].id
  );
  const [ready, setReady] = useState(false);

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
            className={`rounded-full px-5 py-2.5 text-sm transition-colors ${
              active === s.id
                ? "bg-ink-900 text-sand-50"
                : "bg-sand-50 text-ink-700 hover:bg-sand-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="relative min-h-[480px] overflow-hidden rounded-2xl border border-ink-900/10 bg-sand-50">
        {CAL_CONFIGURED ? (
          <>
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-sand-50">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-900/20 border-t-clay-500" />
              </div>
            )}
            <Cal
              key={current.id}
              calLink={current.calLink}
              style={{ width: "100%", height: "480px" }}
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
              className="mt-2 rounded-full bg-clay-500 px-6 py-3 text-sm text-sand-50 transition-colors hover:bg-clay-600"
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
