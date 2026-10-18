# Backend Stack: Consulting Site
 
## Overview
No custom backend or payment code. Booking and payments are handled by third party services owned by the client. The site embeds the booking flow.
 
## Services
 
| Purpose | Tool | Owner |
|---|---|---|
| Hosting | Cloudflare Pages | Client account, Buruk invited |
| Domain | Cloudflare | Client account |
| Site framework | Astro (or static HTML) | BK web studios |
| Scheduling | Cal.com | Client account |
| Payments | Stripe | Client account |
| Video calls | Zoom or Google Meet (via Cal.com) | Client account |
| Calendar sync | Google or Outlook (via Cal.com) | Client account |
| Invoices / retainers | Stripe Payment Links or Stripe Invoicing | Client account |
 
## How It Connects
1. Client creates Cal.com and Stripe accounts.
2. Stripe is connected inside Cal.com (Apps > Stripe).
3. Paid event types require payment at booking.
4. Site embeds the client's public Cal.com booking link (inline or popup).
5. Cal.com handles confirmations, reminders, and meeting links.
6. Stripe handles charges, receipts, refunds, and payouts.
## Access
- Embedding needs only the public booking link. No login required.
- Account configuration done by the client or together on a call.
## Notes
- Loading screen added while Cal.com embed loads