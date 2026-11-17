# Slotline (working name)

Front end for an appointment book used by salons and small clinics. Bookings arrive from a phone line
(handled elsewhere); this app shows them on phone and computer, with day, week, bookings and analytics views.

Front end only. It runs on deterministic sample data generated relative to today. Changes the owner makes
(new bookings, cancellations, settings) are kept in the browser's localStorage.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` produces a fully static build.

## Pages

| Route | What it is |
|---|---|
| `/` | Front page with the terms summary and links to Terms and Privacy |
| `/terms`, `/privacy` | Template legal text, needs legal review before launch |
| `/sign-in`, `/sign-up` | Google, Apple, X, Discord and email forms (design only, nothing is sent) |
| `/app` | Today: count, next appointment, timeline, week bars, staff load |
| `/app/schedule` | Day sheet in half-hour slots, printable |
| `/app/week` | Week grid on laptop, day picker on phone, printable |
| `/app/bookings` | All bookings with filters and search |
| `/app/new` | Add a booking by hand |
| `/app/analytics` | Per-day bookings, busiest times, outcomes, staff and service breakdown |
| `/app/settings` | Salon or clinic mode, business name, hours, staff, services |

## Connecting real data

`lib/store.ts` is the only data-access module. Replace `loadAppointments` with a fetch of real bookings
mapped to the `Appointment` type in `lib/types.ts`. Every screen reads from that one list.
Sign-in providers live in one array in `components/Providers.tsx`.
