import { useState } from "react";

const FAQS = [
  {
    q: "Do sessions happen in person or by video?",
    a: "One-on-one and couples sessions are held by video over Zoom. The Bete Semret weekend workshop is held in person.",
  },
  {
    q: "Does my partner have to be there too?",
    a: "No, one partner can book and attend alone if that works better for your situation.",
  },
  {
    q: "What if I need to cancel or reschedule?",
    a: "Reschedule anytime through the booking system. Cancellations need at least 24 hours notice; sessions missed without notice are billed at 50%.",
  },
  {
    q: "How does the deposit work?",
    a: "A 25% deposit is collected when you book and is non-refundable, but it's applied toward your session.",
  },
] as const;

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-ink-900/10 border-t border-ink-900/10">
      {FAQS.map((item, i) => {
        const expanded = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="font-display text-lg text-ink-900">{item.q}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                className={`h-4 w-4 shrink-0 text-ink-900 transition-transform duration-300 ${
                  expanded ? "rotate-180 text-forest-700" : ""
                }`}
              >
                <path
                  d="M3 6l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div
              className="grid overflow-hidden transition-all duration-300 ease-out"
              style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-6 text-ink-700">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
